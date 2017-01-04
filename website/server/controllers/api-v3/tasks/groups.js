import { authWithHeaders } from '../../../middlewares/auth';
import Bluebird from 'bluebird';
import * as Tasks from '../../../models/task';
import { model as Group } from '../../../models/group';
import { model as User } from '../../../models/user';
import {
  NotFound,
  NotAuthorized,
} from '../../../libs/errors';
import {
  createTasks,
  getTasks,
} from '../../../libs/taskManager';

let requiredGroupFields = '_id leader tasksOrder name';
let types = Tasks.tasksTypes.map(type => `${type}s`);
let api = {};

/**
 * @api {post} /api/v3/tasks/group/:groupId Create a new task belonging to a group
 * @apiDescription Can be passed an object to create a single task or an array of objects to create multiple tasks.
 * @apiName CreateGroupTasks
 * @apiGroup Task
 *
 * @apiParam {UUID} groupId The id of the group the new task(s) will belong to
 *
 * @apiSuccess data An object if a single task was created, otherwise an array of tasks
 */
api.createGroupTasks = {
  method: 'POST',
  url: '/tasks/group/:groupId',
  middlewares: [authWithHeaders()],
  async handler (req, res) {
    req.checkParams('groupId', res.t('groupIdRequired')).notEmpty().isUUID();

    let reqValidationErrors = req.validationErrors();
    if (reqValidationErrors) throw reqValidationErrors;

    let user = res.locals.user;

    let group = await Group.getGroup({user, groupId: req.params.groupId, fields: requiredGroupFields});
    if (!group) throw new NotFound(res.t('groupNotFound'));

    if (group.leader !== user._id) throw new NotAuthorized(res.t('onlyGroupLeaderCanEditTasks'));

    let tasks = await createTasks(req, res, {user, group});

    res.respond(201, tasks.length === 1 ? tasks[0] : tasks);
  },
};

/**
 * @api {get} /api/v3/tasks/group/:groupId Get a group's tasks
 * @apiName GetGroupTasks
 * @apiGroup Task
 *
 * @apiParam {UUID} groupId The id of the group from which to retrieve the tasks
 * @apiParam {string="habits","dailys","todos","rewards"} type Optional query parameter to return just a type of tasks
 *
 * @apiSuccess {Array} data An array of tasks
 */
api.getGroupTasks = {
  method: 'GET',
  url: '/tasks/group/:groupId',
  middlewares: [authWithHeaders()],
  async handler (req, res) {
    req.checkParams('groupId', res.t('groupIdRequired')).notEmpty().isUUID();
    req.checkQuery('type', res.t('invalidTaskType')).optional().isIn(types);

    let validationErrors = req.validationErrors();
    if (validationErrors) throw validationErrors;

    let user = res.locals.user;

    let group = await Group.getGroup({user, groupId: req.params.groupId, fields: requiredGroupFields});
    if (!group) throw new NotFound(res.t('groupNotFound'));

    let tasks = await getTasks(req, res, {user, group});
    res.respond(200, tasks);
  },
};

/**
 * @api {post} /api/v3/tasks/:taskId/assign/:assignedUserId Assign a group task to a user
 * @apiDescription Assigns a user to a group task
 * @apiName AssignTask
 * @apiGroup Task
 *
 * @apiParam {UUID} taskId The id of the task that will be assigned
 * @apiParam {UUID} userId The id of the user that will be assigned to the task
 *
 * @apiSuccess data An object if a single task was created, otherwise an array of tasks
 */
api.assignTask = {
  method: 'POST',
  url: '/tasks/:taskId/assign/:assignedUserId',
  middlewares: [authWithHeaders()],
  async handler (req, res) {
    req.checkParams('taskId', res.t('taskIdRequired')).notEmpty().isUUID();
    req.checkParams('assignedUserId', res.t('userIdRequired')).notEmpty().isUUID();

    let reqValidationErrors = req.validationErrors();
    if (reqValidationErrors) throw reqValidationErrors;

    let user = res.locals.user;
    let assignedUserId = req.params.assignedUserId;
    let assignedUser = await User.findById(assignedUserId);

    let taskId = req.params.taskId;
    let task = await Tasks.Task.findByIdOrAlias(taskId, user._id);

    if (!task) {
      throw new NotFound(res.t('taskNotFound'));
    }

    if (!task.group.id) {
      throw new NotAuthorized(res.t('onlyGroupTasksCanBeAssigned'));
    }

    let groupFields = `${requiredGroupFields} chat`;
    let group = await Group.getGroup({user, groupId: task.group.id, fields: groupFields});
    if (!group) throw new NotFound(res.t('groupNotFound'));

    if (group.leader !== user._id && user._id !== assignedUserId) throw new NotAuthorized(res.t('onlyGroupLeaderCanEditTasks'));

    // User is claiming the task
    if (user._id === assignedUserId) {
      let message = res.t('userIsClamingTask', {username: user.profile.name, task: task.text});
      group.sendChat(message, user);
    }

    let promises = [];
    promises.push(group.syncTask(task, assignedUser));
    promises.push(group.save());
    await Bluebird.all(promises);

    res.respond(200, task);
  },
};

/**
 * @api {post} /api/v3/tasks/:taskId/unassign/:assignedUserId Unassign a user from a task
 * @apiDescription Unassigns a user to from a group task
 * @apiName UnassignTask
 * @apiGroup Task
 *
 * @apiParam {UUID} taskId The id of the task that will be assigned
 * @apiParam {UUID} userId The id of the user that will be assigned to the task
 *
 * @apiSuccess data An object if a single task was created, otherwise an array of tasks
 */
api.unassignTask = {
  method: 'POST',
  url: '/tasks/:taskId/unassign/:assignedUserId',
  middlewares: [authWithHeaders()],
  async handler (req, res) {
    req.checkParams('taskId', res.t('taskIdRequired')).notEmpty().isUUID();
    req.checkParams('assignedUserId', res.t('userIdRequired')).notEmpty().isUUID();

    let reqValidationErrors = req.validationErrors();
    if (reqValidationErrors) throw reqValidationErrors;

    let user = res.locals.user;
    let assignedUserId = req.params.assignedUserId;
    let assignedUser = await User.findById(assignedUserId);

    let taskId = req.params.taskId;
    let task = await Tasks.Task.findByIdOrAlias(taskId, user._id);

    if (!task) {
      throw new NotFound(res.t('taskNotFound'));
    }

    if (!task.group.id) {
      throw new NotAuthorized(res.t('onlyGroupTasksCanBeAssigned'));
    }

    let group = await Group.getGroup({user, groupId: task.group.id, fields: requiredGroupFields});
    if (!group) throw new NotFound(res.t('groupNotFound'));

    if (group.leader !== user._id) throw new NotAuthorized(res.t('onlyGroupLeaderCanEditTasks'));

    await group.unlinkTask(task, assignedUser);

    res.respond(200, task);
  },
};

/**
 * @api {post} /api/v3/tasks/:taskId/approve/:userId Approve a user's task
 * @apiDescription Approves a user assigned to a group task
 * @apiVersion 3.0.0
 * @apiName ApproveTask
 * @apiGroup Task
 *
 * @apiParam {UUID} taskId The id of the task that is the original group task
 * @apiParam {UUID} userId The id of the user that will be approved
 *
 * @apiSuccess task The approved task
 */
api.approveTask = {
  method: 'POST',
  url: '/tasks/:taskId/approve/:userId',
  middlewares: [authWithHeaders()],
  async handler (req, res) {
    req.checkParams('taskId', res.t('taskIdRequired')).notEmpty().isUUID();
    req.checkParams('userId', res.t('userIdRequired')).notEmpty().isUUID();

    let reqValidationErrors = req.validationErrors();
    if (reqValidationErrors) throw reqValidationErrors;

    let user = res.locals.user;
    let assignedUserId = req.params.userId;
    let assignedUser = await User.findById(assignedUserId);

    let taskId = req.params.taskId;
    let task = await Tasks.Task.findOne({
      'group.taskId': taskId,
      userId: assignedUserId,
    });

    if (!task) {
      throw new NotFound(res.t('taskNotFound'));
    }

    let group = await Group.getGroup({user, groupId: task.group.id, fields: requiredGroupFields});
    if (!group) throw new NotFound(res.t('groupNotFound'));

    if (group.leader !== user._id) throw new NotAuthorized(res.t('onlyGroupLeaderCanEditTasks'));

    task.group.approval.dateApproved = new Date();
    task.group.approval.approvingUser = user._id;
    task.group.approval.approved = true;

    assignedUser.addNotification('GROUP_TASK_APPROVED', {
      message: res.t('yourTaskHasBeenApproved', {taskText: task.text}),
      groupId: group._id,
    });

    assignedUser.addNotification('SCORED_TASK', {
      message: res.t('yourTaskHasBeenApproved', {taskText: task.text}),
      scoreTask: task,
    });

    await Bluebird.all([assignedUser.save(), task.save()]);

    res.respond(200, task);
  },
};

/**
 * @api {get} /api/v3/approvals/group/:groupId Get a group's approvals
 * @apiVersion 3.0.0
 * @apiName GetGroupApprovals
 * @apiGroup Task
 *
 * @apiParam {UUID} groupId The id of the group from which to retrieve the approvals
 *
 * @apiSuccess {Array} data An array of tasks
 */
api.getGroupApprovals = {
  method: 'GET',
  url: '/approvals/group/:groupId',
  middlewares: [authWithHeaders()],
  async handler (req, res) {
    req.checkParams('groupId', res.t('groupIdRequired')).notEmpty().isUUID();

    let validationErrors = req.validationErrors();
    if (validationErrors) throw validationErrors;

    let user = res.locals.user;
    let groupId = req.params.groupId;

    let group = await Group.getGroup({user, groupId, fields: requiredGroupFields});
    if (!group) throw new NotFound(res.t('groupNotFound'));

    if (group.leader !== user._id) throw new NotAuthorized(res.t('onlyGroupLeaderCanEditTasks'));

    let approvals = await Tasks.Task.find({
      'group.id': groupId,
      'group.approval.approved': false,
      'group.approval.requested': true,
    }, 'userId group text')
    .populate('userId', 'profile')
    .exec();

    res.respond(200, approvals);
  },
};

module.exports = api;
