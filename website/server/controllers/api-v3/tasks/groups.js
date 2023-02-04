import isUUID from 'validator/lib/isUUID';
import { authWithHeaders } from '../../../middlewares/auth';
import * as Tasks from '../../../models/task';
import { model as Group } from '../../../models/group';
import { model as User } from '../../../models/user';
import {
  BadRequest,
  NotFound,
  NotAuthorized,
} from '../../../libs/errors';
import {
  canNotEditTasks,
  createTasks,
  getTasks,
  groupSubscriptionNotFound,
  scoreTasks,
} from '../../../libs/tasks';
import {
  moveTask,
} from '../../../libs/tasks/utils';
import apiError from '../../../libs/apiError';

const requiredGroupFields = '_id leader tasksOrder name';
// @TODO: abstract to task lib
const types = Tasks.tasksTypes.map(type => `${type}s`);
// _allCompletedTodos is currently in BETA and is likely to be removed in future
types.push('completedTodos', '_allCompletedTodos');

const api = {};

/**
 * @api {post} /api/v3/tasks/group/:groupId Create a new task belonging to a group
 * @apiDescription Can be passed an object to create a single task or
 * an array of objects to create multiple tasks.
 * @apiName CreateGroupTasks
 * @apiGroup Task
 *
 * @apiParam (Path) {UUID} groupId The id of the group the new task(s) will belong to
 *
 * @apiSuccess data An object if a single task was created, otherwise an array of tasks
 */
api.createGroupTasks = {
  method: 'POST',
  url: '/tasks/group/:groupId',
  middlewares: [authWithHeaders()],
  async handler (req, res) {
    req.checkParams('groupId', apiError('groupIdRequired')).notEmpty().isUUID();

    const reqValidationErrors = req.validationErrors();
    if (reqValidationErrors) throw reqValidationErrors;

    const { user } = res.locals;

    const fields = requiredGroupFields.concat(' purchased managers');
    const group = await Group.getGroup({ user, groupId: req.params.groupId, fields });
    if (groupSubscriptionNotFound(group)) throw new NotFound(res.t('groupNotFound'));

    if (canNotEditTasks(group, user)) throw new NotAuthorized(res.t('onlyGroupLeaderCanEditTasks'));

    const tasks = await createTasks(req, res, { user, group });

    res.respond(201, tasks.length === 1 ? tasks[0] : tasks);

    tasks.forEach(task => {
      res.analytics.track('team task created', {
        uuid: user._id,
        hitType: 'event',
        category: 'behavior',
        taskType: task.type,
        groupID: group._id,
        headers: req.headers,
      });
    });
  },
};

/**
 * @api {get} /api/v3/tasks/group/:groupId Get a group's tasks
 * @apiName GetGroupTasks
 * @apiGroup Task
 *
 * @apiParam (Path) {UUID} groupId The id of the group from which to retrieve the tasks
 * @apiParam (Query) {string="habits","dailys","todos","rewards"} [type] Query parameter to
 *                                                                       return just a type of tasks
 *
 * @apiSuccess {Array} data An array of tasks
 */
api.getGroupTasks = {
  method: 'GET',
  url: '/tasks/group/:groupId',
  middlewares: [authWithHeaders()],
  async handler (req, res) {
    req.checkParams('groupId', apiError('groupIdRequired')).notEmpty().isUUID();
    req.checkQuery('type', res.t('invalidTasksType')).optional().isIn(types);

    const validationErrors = req.validationErrors();
    if (validationErrors) throw validationErrors;

    const { user } = res.locals;

    const group = await Group.getGroup({
      user,
      groupId: req.params.groupId,
      fields: requiredGroupFields.concat(' purchased'),
    });
    if (groupSubscriptionNotFound(group)) throw new NotFound(res.t('groupNotFound'));

    const tasks = await getTasks(req, res, { user, group });
    res.respond(200, tasks);
  },
};

/**
 * @api {post} /api/v3/group/:groupId/tasks/:taskId/move/to/:position
 * Move a group task to a specified position
 * @apiDescription Moves a group task to a specified position
 * @apiVersion 3.0.0
 * @apiName GroupMoveTask
 * @apiGroup Task
 *
 * @apiParam (Path) {String} taskId The task _id
 * @apiParam (Path) {Number} position Where to move the task.
 *                                    0 = top of the list ("push to top").
 *                                   -1 = bottom of the list ("push to bottom").
 *
 * @apiSuccess {Array} data The new tasks order (group.tasksOrder.{task.type}s)
 */
api.groupMoveTask = {
  method: 'POST',
  url: '/group-tasks/:taskId/move/to/:position',
  middlewares: [authWithHeaders()],
  async handler (req, res) {
    req.checkParams('taskId', apiError('taskIdRequired')).notEmpty();
    req.checkParams('position', res.t('positionRequired')).notEmpty().isNumeric();

    const reqValidationErrors = req.validationErrors();
    if (reqValidationErrors) throw reqValidationErrors;

    const { user } = res.locals;

    const { taskId } = req.params;
    const task = await Tasks.Task.findOne({
      _id: taskId,
    }).exec();

    const to = Number(req.params.position);

    if (!task) {
      throw new NotFound(res.t('messageTaskNotFound'));
    }

    if (task.type === 'todo' && task.completed) throw new BadRequest(res.t('cantMoveCompletedTodo'));

    const groupFields = requiredGroupFields.concat(' managers purchased');
    const group = await Group.getGroup({
      user,
      groupId: task.group.id,
      fields: groupFields,
    });
    if (groupSubscriptionNotFound(group)) throw new NotFound(res.t('groupNotFound'));

    if (canNotEditTasks(group, user)) throw new NotAuthorized(res.t('onlyGroupLeaderCanEditTasks'));

    const order = group.tasksOrder[`${task.type}s`];

    if (order.indexOf(task._id) === -1) { // task is missing from list, list needs repair
      const taskList = await Tasks.Task.find(
        { 'group.id': group._id, userId: { $exists: false }, type: task.type },
        { _id: 1 },
      ).exec();
      for (const foundTask of taskList) {
        if (order.indexOf(foundTask._id) === -1) {
          order.push(foundTask._id);
        }
      }
      const fixQuery = { $set: {} };
      fixQuery.$set[`tasksOrder.${task.type}s`] = order;
      await group.update(fixQuery).exec();
    }

    moveTask(order, task._id, to);

    await group.save();
    res.respond(200, order);
  },
};

/**
 * @api {post} /api/v3/tasks/:taskId/assign Assign a group task to a user or users
 * @apiDescription Assign users to a group task
 * @apiName AssignTask
 * @apiGroup Task
 *
 * @apiParam (Path) {UUID} taskId The id of the task that will be assigned
 * @apiParam (Body) {UUID[]} [assignedUserIds] Array of user IDs to be assigned to the task
 *
 * @apiSuccess data The assigned task
 */
api.assignTask = {
  method: 'POST',
  url: '/tasks/:taskId/assign',
  middlewares: [authWithHeaders()],
  async handler (req, res) {
    req.checkParams('taskId', apiError('taskIdRequired')).notEmpty().isUUID();

    const reqValidationErrors = req.validationErrors();
    if (reqValidationErrors) throw reqValidationErrors;

    const { user } = res.locals;
    const assignedUserIds = req.body;
    for (const userId of assignedUserIds) {
      if (!isUUID(userId)) throw new BadRequest('Assigned users must be UUIDs');
    }

    const { taskId } = req.params;
    const task = await Tasks.Task.findByIdOrAlias(taskId, user._id);

    if (!task) {
      throw new NotFound(res.t('messageTaskNotFound'));
    }

    if (!task.group.id) {
      throw new NotAuthorized(res.t('onlyGroupTasksCanBeAssigned'));
    }

    const groupFields = `${requiredGroupFields} purchased chat managers`;
    const group = await Group.getGroup({ user, groupId: task.group.id, fields: groupFields });
    if (groupSubscriptionNotFound(group)) throw new NotFound(res.t('groupNotFound'));

    if (canNotEditTasks(group, user)) throw new NotAuthorized(res.t('onlyGroupLeaderCanEditTasks'));

    const assignedUsers = await User.find({ _id: { $in: assignedUserIds } }).exec();
    const promises = [];
    const taskText = task.text;
    const userName = `@${user.auth.local.username}`;

    for (const userToAssign of assignedUsers) {
      if (user._id !== userToAssign._id) {
        userToAssign.addNotification('GROUP_TASK_ASSIGNED', {
          message: res.t('youHaveBeenAssignedTask', { managerName: userName, taskText }),
          groupId: group._id,
          taskId: task._id,
        });
      }
    }

    promises.push(group.syncTask(task, assignedUsers, user));
    promises.push(group.save());
    await Promise.all(promises);

    res.respond(200, task);

    res.analytics.track('task assign', {
      uuid: user._id,
      hitType: 'event',
      category: 'behavior',
      taskType: task.type,
      groupID: group._id,
      headers: req.headers,
    });
  },
};

/**
 * @api {post} /api/v3/tasks/:taskId/unassign/:assignedUserId Unassign a user from a task
 * @apiDescription Unassigns a user from a group task
 * @apiName UnassignTask
 * @apiGroup Task
 *
 * @apiParam (Path) {UUID} taskId The id of the task that is the original group task
 * @apiParam (Path) {UUID} assignedUserId The id of the user that will be unassigned from the task
 *
 * @apiSuccess data The unassigned task
 */
api.unassignTask = {
  method: 'POST',
  url: '/tasks/:taskId/unassign/:assignedUserId',
  middlewares: [authWithHeaders()],
  async handler (req, res) {
    req.checkParams('taskId', apiError('taskIdRequired')).notEmpty().isUUID();
    req.checkParams('assignedUserId', res.t('userIdRequired')).notEmpty().isUUID();

    const reqValidationErrors = req.validationErrors();
    if (reqValidationErrors) throw reqValidationErrors;

    const { user } = res.locals;
    const { assignedUserId } = req.params;
    const assignedUser = await User.findById(assignedUserId).exec();

    const { taskId } = req.params;
    const task = await Tasks.Task.findByIdOrAlias(taskId, user._id);

    if (!task) {
      throw new NotFound(res.t('messageTaskNotFound'));
    }

    if (!task.group.id) {
      throw new NotAuthorized(res.t('onlyGroupTasksCanBeAssigned'));
    }

    const fields = requiredGroupFields.concat(' purchased managers');
    const group = await Group.getGroup({ user, groupId: task.group.id, fields });
    if (groupSubscriptionNotFound(group)) throw new NotFound(res.t('groupNotFound'));

    if (canNotEditTasks(group, user)) throw new NotAuthorized(res.t('onlyGroupLeaderCanEditTasks'));

    await group.unlinkTask(task, assignedUser);

    const notificationIndex = assignedUser.notifications.findIndex(notification => notification && notification.data && notification.type === 'GROUP_TASK_ASSIGNED' && notification.data.taskId === task._id);

    if (notificationIndex !== -1) {
      assignedUser.notifications.splice(notificationIndex, 1);
      await assignedUser.save();
    }

    res.respond(200, task);
  },
};

/**
 * @api {post} /api/v3/tasks/:taskId/needs-work/:userId Require more work for a group task
 * @apiDescription Mark an assigned group task as needing more work before it can be approved
 * @apiVersion 3.0.0
 * @apiName TaskNeedsWork
 * @apiGroup Task
 *
 * @apiParam (Path) {UUID} taskId The id of the task that is the original group task
 * @apiParam (Path) {UUID} userId The id of the assigned user
 *
 * @apiSuccess task The task that needs more work
 */
api.taskNeedsWork = {
  method: 'POST',
  url: '/tasks/:taskId/needs-work/:userId',
  middlewares: [authWithHeaders()],
  async handler (req, res) {
    req.checkParams('taskId', apiError('taskIdRequired')).notEmpty().isUUID();
    req.checkParams('userId', res.t('userIdRequired')).notEmpty().isUUID();

    const reqValidationErrors = req.validationErrors();
    if (reqValidationErrors) throw reqValidationErrors;

    const { user } = res.locals;

    const assignedUserId = req.params.userId;
    const { taskId } = req.params;

    const [assignedUser, task] = await Promise.all([
      User.findById(assignedUserId).exec(),
      await Tasks.Task.findOne({
        _id: taskId,
      }).exec(),
    ]);

    if (!task) {
      throw new NotFound(res.t('messageTaskNotFound'));
    }
    if (['daily', 'todo'].indexOf(task.type) === -1) {
      throw new BadRequest('Cannot roll back use of Habits or Rewards.');
    }

    if (task.group.completedBy.userId) {
      if (task.group.completedBy.userId !== assignedUserId) {
        throw new BadRequest('Task not completed by this user.');
      }
    } else if (!task.group.assignedUsersDetail || !task.group.assignedUsersDetail[assignedUserId]
        || !task.group.assignedUsersDetail[assignedUserId].completed) {
      throw new BadRequest('Task not completed by this user.');
    }

    const fields = requiredGroupFields.concat(' purchased managers');
    const group = await Group.getGroup({ user, groupId: task.group.id, fields });
    if (groupSubscriptionNotFound(group)) throw new NotFound(res.t('groupNotFound'));

    if (canNotEditTasks(group, user)) throw new NotAuthorized(res.t('onlyGroupLeaderCanEditTasks'));

    await scoreTasks(assignedUser, [{ id: task._id, direction: 'down' }], req, res);
    if (assignedUserId !== user._id) {
      assignedUser.addNotification('GROUP_TASK_NEEDS_WORK', {
        message: res.t('taskNeedsWork', { taskText: task.text, managerName: user.auth.local.username }, assignedUser.preferences.language),
        task: {
          id: task._id,
          text: task.text,
        },
        group: {
          id: group._id,
          name: group.name,
        },
        manager: {
          id: user._id,
          name: user.auth.local.username,
        },
      });
    }
    await Promise.all([assignedUser.save(), task.save()]);

    res.respond(200, task);
  },
};

export default api;
