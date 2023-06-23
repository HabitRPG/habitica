import moment from 'moment';
import cloneDeep from 'lodash/cloneDeep';
import compact from 'lodash/compact';
import forEach from 'lodash/forEach';
import keys from 'lodash/keys';
import remove from 'lodash/remove';
import validator from 'validator';
import {
  setNextDue,
  validateTaskAlias,
  requiredGroupFields,
} from './utils';
import { model as Challenge } from '../../models/challenge';
import { model as Group } from '../../models/group';
import { model as User } from '../../models/user';
import * as Tasks from '../../models/task';
import apiError from '../apiError';
import {
  BadRequest,
  NotFound,
  NotAuthorized,
} from '../errors';
import {
  handleSharedCompletion,
} from '../groupTasks';
import shared from '../../../common';
import { taskScoredWebhook } from '../webhook';

import logger from '../logger';

/**
 * Creates tasks for a user, challenge or group.
 *
 * @param  req  The Express req variable
 * @param  res  The Express res variable
 * @param  options
 * @param  options.user  The user that these tasks belong to
 * @param  options.challenge  The challenge that these tasks belong to
 * @param  options.group  The group that these tasks belong to
 * @param  options.requiresApproval  A boolean stating if the task will require approval
 * @return The created tasks
 */
async function createTasks (req, res, options = {}) {
  const {
    user,
    challenge,
    group,
  } = options;

  const owner = group || challenge || user;

  let toSave = Array.isArray(req.body) ? req.body : [req.body];

  // Return if no tasks are passed, avoids errors with mongo $push being empty
  if (toSave.length === 0) return [];

  const taskOrderToAdd = {};

  toSave = toSave.map(taskData => {
    // Validate that task.type is valid
    if (!taskData || Tasks.tasksTypes.indexOf(taskData.type) === -1) throw new BadRequest(res.t('invalidTaskType'));

    const taskType = taskData.type;
    const newTask = new Tasks[taskType](Tasks.Task.sanitize(taskData));

    if (challenge) {
      newTask.challenge.id = challenge.id;
    } else if (group) {
      newTask.group.id = group._id;
      newTask.tags = [group._id];
      newTask.group.managerNotes = taskData.managerNotes || '';
    } else {
      newTask.userId = user._id;

      // user.flags.welcomed is checked because when false it means the tasks being created
      // are the onboarding ones
      if (!user.achievements.createdTask && user.flags.welcomed) {
        user.addAchievement('createdTask');
        shared.onboarding.checkOnboardingStatus(user, req, res.analytics);
      }
    }

    // set startDate to midnight in the user's timezone
    if (taskType === 'daily') {
      const awareStartDate = moment(newTask.startDate).utcOffset(-user.preferences.timezoneOffset);
      if (awareStartDate.format('HMsS') !== '0000') {
        awareStartDate.startOf('day');
        newTask.startDate = awareStartDate.toDate();
      }
    }

    setNextDue(newTask, user);

    // Validate that the task is valid and throw if it isn't
    // otherwise since we're saving user/challenge/group
    // and task in parallel it could save the user/challenge/group
    // with a tasksOrder that doens't match reality
    const validationErrors = newTask.validateSync();
    if (validationErrors) throw validationErrors;

    // Otherwise update the user/challenge/group
    if (!taskOrderToAdd[`${taskType}s`]) taskOrderToAdd[`${taskType}s`] = [];
    if (!owner.tasksOrder[`${taskType}s`].includes(newTask._id)) taskOrderToAdd[`${taskType}s`].unshift(newTask._id);

    return newTask;
  });

  // Push all task ids
  const taskOrderUpdateQuery = { $push: {} };
  for (const taskType of Object.keys(taskOrderToAdd)) {
    taskOrderUpdateQuery.$push[`tasksOrder.${taskType}`] = {
      $each: taskOrderToAdd[taskType],
      $position: 0,
    };
  }

  await owner.updateOne(taskOrderUpdateQuery).exec();

  // tasks with aliases need to be validated asynchronously
  await validateTaskAlias(toSave, res);

  // If all tasks are valid (this is why it's not in the previous .map()),
  // save everything, withough running validation again
  toSave = toSave.map(task => task.save({
    validateBeforeSave: false,
  }));

  toSave.unshift(owner.save());

  const tasks = await Promise.all(toSave);
  tasks.splice(0, 1); // Remove user, challenge, or group promise
  return tasks;
}

/**
 * Gets tasks for a user, challenge or group.
 *
 * @param  req  The Express req variable
 * @param  res  The Express res variable
 * @param  options
 * @param  options.user  The user that these tasks belong to
 * @param  options.challenge  The challenge that these tasks belong to
 * @param  options.group  The group that these tasks belong to
 * @param  options.dueDate The date to use for computing the nextDue field for each returned task
 * @return The tasks found
 */
async function getTasks (req, res, options = {}) {
  const {
    user,
    challenge,
    group,
    dueDate,
  } = options;

  let query;
  let limit;
  let sort;
  let upgradedGroups = [];
  const upgradedGroupIds = [];
  const owner = group || challenge || user;

  if (challenge) {
    query = { 'challenge.id': challenge.id, userId: { $exists: false } };
  } else if (group) {
    query = { 'group.id': group._id };
  } else {
    const groupsToMirror = user.preferences.tasks.mirrorGroupTasks;
    if (groupsToMirror && groupsToMirror.length > 0) {
      upgradedGroups = await Group.find(
        {
          _id: { $in: groupsToMirror },
          'purchased.plan.customerId': { $exists: true },
          $or: [
            { 'purchased.plan.dateTerminated': { $exists: false } },
            { 'purchased.plan.dateTerminated': null },
            { 'purchased.plan.dateTerminated': { $gt: new Date() } },
          ],
        },
        { _id: 1 },
      ).exec();
    }
    if (upgradedGroups.length > 0) {
      for (const upgradedGroup of upgradedGroups) {
        upgradedGroupIds.push(upgradedGroup._id);
      }
      query = {
        $or: [
          { userId: user._id },
          {
            'group.id': { $in: upgradedGroupIds },
            $or: [
              { 'group.assignedUsers': user._id },
              { 'group.assignedUsers.0': { $exists: false } },
            ],
          },
        ],
      };
    } else {
      query = { userId: user._id };
    }
  }

  const { type } = req.query;

  if (type) {
    if (type === 'todos') {
      query.type = 'todo';
      query.completed = false; // Exclude completed todos
    } else if (type === 'completedTodos' || type === '_allCompletedTodos') { // _allCompletedTodos is currently in BETA and is likely to be removed in future
      limit = 30;

      if (type === '_allCompletedTodos') {
        limit = 0; // no limit
      }

      query.type = 'todo';
      query.completed = true;

      if (upgradedGroups.length > 0) {
        query.$or = [
          { userId: user._id },
          {
            'group.id': { $in: upgradedGroupIds },
            $or: [
              { 'group.assignedUsers': user._id },
              { 'group.completedBy.userId': user._id },
            ],
          },
        ];
      } else if (owner._id === user._id) {
        query.userId = user._id;
      }

      sort = {
        dateCompleted: -1,
      };
    } else {
      query.type = type.slice(0, -1); // removing the final "s"
    }
  } else {
    query.$and = [{
      $or: [ // Exclude completed todos
        { type: 'todo', completed: false },
        { type: { $in: ['habit', 'daily', 'reward'] } },
      ],
    }];
  }

  const mQuery = Tasks.Task.find(query);
  if (limit) mQuery.limit(limit);
  if (sort) mQuery.sort(sort);

  const tasks = await mQuery.exec();

  if (dueDate) {
    tasks.forEach(task => {
      setNextDue(task, user, dueDate);
    });
  }

  let ownerDirty = false;
  // Prune nonexistent tasks from tasksOrder
  forEach(owner.tasksOrder, (taskOrder, key) => {
    if (type && key.slice(0, -1) !== type) return;
    const preLength = taskOrder.length;
    remove(taskOrder, taskId => tasks.findIndex(task => task._id === taskId) === -1);
    if (preLength !== taskOrder.length) {
      owner.tasksOrder[key] = taskOrder;
      owner.markModified('tasksOrder');
      ownerDirty = true;
    }
  });

  // Order tasks based on tasksOrder
  let order = [];
  if (type && type !== 'completedTodos' && type !== '_allCompletedTodos') {
    order = owner.tasksOrder[type];
  } else if (!type) {
    Object.values(owner.tasksOrder).forEach(taskOrder => {
      order = order.concat(taskOrder);
    });
  } else {
    return tasks;
  }

  let orderedTasks = new Array(tasks.length);
  const unorderedTasks = []; // what we want to add later

  tasks.forEach((task, index) => {
    const taskId = task._id;
    const i = order[index] === taskId ? index : order.indexOf(taskId);
    if (i === -1) {
      unorderedTasks.push(task);
      const typeString = `${task.type}s`;
      owner.tasksOrder[typeString].push(taskId);
      ownerDirty = true;
    } else {
      orderedTasks[i] = task;
    }
  });

  if (ownerDirty) await owner.save();

  // Remove empty values from the array and add any unordered task
  orderedTasks = compact(orderedTasks).concat(unorderedTasks);
  return orderedTasks;
}

function canNotEditTasks (group, user, assignedUserId) {
  const isNotGroupLeader = group.leader !== user._id;
  const isManager = Boolean(group.managers[user._id]);
  const userIsAssigningToSelf = Boolean(assignedUserId && user._id === assignedUserId);
  return isNotGroupLeader && !isManager && !userIsAssigningToSelf;
}

function groupSubscriptionNotFound (group) {
  return !group || !group.purchased || !group.purchased.plan || !group.purchased.plan.customerId
   || (group.purchased.plan.dateTerminated && group.purchased.plan.dateTerminated < new Date());
}

async function getGroupFromTaskAndUser (task, user) {
  if (task.group.id && !task.userId) {
    const fields = requiredGroupFields.concat(' managers');
    return Group.getGroup({ user, groupId: task.group.id, fields });
  }
  return null;
}

async function getChallengeFromTask (task) {
  if (task.challenge.id && !task.userId) {
    return Challenge.findOne({ _id: task.challenge.id }).exec();
  }
  return null;
}

function verifyTaskModification (task, user, group, challenge, res) {
  if (!task) {
    throw new NotFound(res.t('messageTaskNotFound'));
  } else if (task.group.id && !task.userId) {
    if (!group) throw new NotFound(res.t('groupNotFound'));
    if (canNotEditTasks(group, user)) throw new NotAuthorized(res.t('onlyGroupLeaderCanEditTasks'));

  // If the task belongs to a challenge make sure the user has rights
  } else if (task.challenge.id && !task.userId) {
    if (!challenge) throw new NotFound(res.t('challengeNotFound'));
    if (!challenge.canModify(user)) throw new NotAuthorized(res.t('onlyChalLeaderEditTasks'));

  // If the task is owned by a user make it's the current one
  } else if (task.userId !== user._id) {
    throw new NotFound(res.t('messageTaskNotFound'));
  }
}

async function handleChallengeTask (task, delta, direction) {
  if (task.challenge && task.challenge.id && task.challenge.taskId && !task.challenge.broken && task.type !== 'reward') {
    // Wrapping everything in a try/catch block because if an error occurs
    // using `await` it MUST NOT bubble up because the request has already been handled
    try {
      const chalTask = await Tasks.Task.findOne({
        _id: task.challenge.taskId,
      }).exec();

      if (!chalTask) return;

      await chalTask.scoreChallengeTask(delta, direction);
    } catch (e) {
      logger.error(e, 'Error scoring challenge task');
    }
  }
}

async function handleTeamTask (task, delta, direction) {
  if (task.group && task.group.taskId) {
    // Wrapping everything in a try/catch block because if an error occurs
    // using `await` it MUST NOT bubble up because the request has already been handled
    try {
      const teamTask = await Tasks.Task.findOne({
        _id: task.group.taskId,
      }).exec();

      if (teamTask) {
        const groupDelta = teamTask.group.assignedUsers
          ? delta / keys(teamTask.group.assignedUsers).length
          : delta;
        await teamTask.scoreChallengeTask(groupDelta, direction);
        if (task.type === 'daily' || task.type === 'todo') {
          await handleSharedCompletion(teamTask);
        }
      }
    } catch (e) {
      logger.error(e, 'Error scoring group task');
    }
  }
}

/**
 * Scores a task.
 * @param user the user that is making the operation
 * @param task The task to score
 * @param direction "up" or "down" depending on how the task should be scored
 *
 * @return Response Data
*/
async function scoreTask (user, task, direction, req, res) {
  if (task.type === 'daily' || task.type === 'todo') {
    if (task.group.id && task.group.assignedUsersDetail
      && task.group.assignedUsersDetail[user._id]
    ) {
      if (task.group.assignedUsersDetail[user._id].completed && direction === 'up') {
        throw new NotAuthorized(res.t('sessionOutdated'));
      } else if (!task.group.assignedUsersDetail[user._id].completed && direction === 'down') {
        throw new NotAuthorized(res.t('sessionOutdated'));
      }
    } else if (task.completed && direction === 'up') {
      throw new NotAuthorized(res.t('sessionOutdated'));
    } else if (!task.completed && direction === 'down') {
      throw new NotAuthorized(res.t('sessionOutdated'));
    }
  }

  let rollbackUser;
  let group;

  if (task.group.id) {
    group = await Group.getGroup({
      user,
      groupId: task.group.id,
      fields: 'leader managers',
    });
  }
  if (
    group && task.group.id && !task.userId // Task is on team board
    && ['todo', 'daily'].includes(task.type) // Task is a To Do or Daily
    && direction === 'down' // Task is being "unchecked"
  ) {
    const userIsManagement = group.leader === user._id || Boolean(group.managers[user._id]);
    if (!userIsManagement
      && !(task.group.completedBy && task.group.completedBy.userId === user._id)
      && !(task.group.assignedUsersDetail && task.group.assignedUsersDetail[user._id])
    ) {
      throw new BadRequest('Cannot uncheck task you did not complete if not a manager.');
    }
    if (task.group.assignedUsers && keys(task.group.assignedUsers).length === 1) {
      const rollbackUserId = keys(task.group.assignedUsers)[0];
      rollbackUser = await User.findOne({ _id: rollbackUserId });
    } else {
      rollbackUser = await User.findOne({ _id: task.group.completedBy.userId });
    }
    task.group.completedBy = {};
  }

  const wasCompleted = task.completed;
  const firstTask = !user.achievements.completedTask;
  let delta;

  if (rollbackUser) {
    delta = shared.ops.scoreTask({
      task,
      user: rollbackUser,
      direction,
    }, req, res.analytics);
    await rollbackUser.save();
  } else {
    delta = shared.ops.scoreTask({ task, user, direction }, req, res.analytics);
  }
  // Drop system (don't run on the client,
  // as it would only be discarded since ops are sent to the API, not the results)
  if (direction === 'up' && !firstTask) shared.fns.randomDrop(user, { task, delta }, req, res.analytics);

  // If a todo was completed or uncompleted move it in or out of the user.tasksOrder.todos list
  // TODO move to common code?
  let pullTask;
  let pushTask;
  if (task.type === 'todo') {
    if (!wasCompleted && task.completed) {
      // @TODO: mongoose's push and pull should be atomic and help with
      // our concurrency issues. If not, we need to use this update $pull and $push
      pullTask = task._id;
    } else if (
      wasCompleted
      && !task.completed
      && user.tasksOrder.todos.indexOf(task._id) === -1
    ) {
      pushTask = task._id;
    }
  }

  if (task.completed && task.group.id
    && !task.userId && !task.group.assignedUsers) {
    task.group.completedBy = {
      userId: user._id,
      date: new Date(),
    };
  }

  setNextDue(task, user);

  taskScoredWebhook.send(user, {
    task,
    direction,
    delta,
    user,
  });

  if (group) {
    let role;
    if (group.leader === user._id) {
      role = 'leader';
    } else if (group.managers[user._id]) {
      role = 'manager';
    } else {
      role = 'member';
    }
    res.analytics.track('team task scored', {
      uuid: user._id,
      hitType: 'event',
      category: 'behavior',
      taskType: task.type,
      direction,
      headers: req.headers,
      groupID: group._id,
      role,
    });
  }

  return {
    task,
    delta,
    direction,
    pullTask,
    pushTask,
    // clone user._tmp so that it's not overwritten by other score operations
    // when using the bulk scoring API
    _tmp: cloneDeep(user._tmp),
  };
}

export async function scoreTasks (user, taskScorings, req, res) {
  // Validate the parameters

  // taskScorings must be array with at least one value
  if (!taskScorings || !Array.isArray(taskScorings) || taskScorings.length < 1) {
    throw new BadRequest(apiError('invalidTaskScorings'));
  }

  taskScorings.forEach(({ id, direction }) => {
    if (!['up', 'down'].includes(direction)) throw new BadRequest(apiError('directionUpDown'));
    if (typeof id !== 'string') throw new BadRequest(apiError('invalidTaskIdentifier'));
  });

  // Get an array of tasks identifiers
  const taskIds = taskScorings.map(taskScoring => taskScoring.id);

  const tasks = {};
  (await Tasks.Task.findMultipleByIdOrAlias(taskIds, user._id)).forEach(task => {
    tasks[task._id] = task;
    if (task.alias) {
      tasks[task.alias] = task;
    }
  });

  if (Object.keys(tasks).length === 0) throw new NotFound(res.t('messageTaskNotFound'));

  // Score each task separately to make sure changes to user._tmp don't overlap.
  // scoreTask is an async function but the only async operation happens when a group task
  // is involved
  // @TODO refactor user._tmp to allow more than one task scoring - breaking change
  const returnDatas = [];

  for (const taskScoring of taskScorings) {
    const task = tasks[taskScoring.id];
    if (task) {
      // If one of the task scoring fails the entire operation will result in a failure
      // It's the only way to ensure the user doesn't end up in an inconsistent state.
      returnDatas.push(await scoreTask( // eslint-disable-line no-await-in-loop
        user,
        task,
        taskScoring.direction,
        req,
        res,
      ));
    }
  }

  const savePromises = [user.save()];

  // Save the tasks, use the tasks object and not returnDatas.*.task to avoid saving the same
  // task twice, allows scoring the same task multiple times in a single request
  Object.keys(tasks).forEach(identifier => {
    // Tasks identified by an alias exists with two keys (id and alias) in the tasks object
    // ignore the alias to avoid saving them twice
    if (validator.isUUID(String(identifier)) && tasks[identifier].isModified()) {
      savePromises.push(tasks[identifier].save());
    }
  });

  // Handle todos removal or addition to the tasksOrder array
  const pullIDs = [];
  const pushIDs = [];

  returnDatas.forEach(returnData => {
    if (returnData.pushTask) pushIDs.push(returnData.pushTask);
    if (returnData.pullTask) pullIDs.push(returnData.pullTask);
  });

  const moveUpdateObject = {};
  if (pushIDs.length > 0) moveUpdateObject.$push = { 'tasksOrder.todos': { $each: pushIDs } };
  if (pullIDs.length > 0) moveUpdateObject.$pull = { 'tasksOrder.todos': { $in: pullIDs } };
  if (pushIDs.length > 0 || pullIDs.length > 0) {
    savePromises.push(user.updateOne(moveUpdateObject).exec());
  }

  await Promise.all(savePromises);

  return returnDatas.map(data => {
    // Handle challenge and group tasks tasks here because the task must have been saved first
    handleChallengeTask(data.task, data.delta, data.direction);
    handleTeamTask(data.task, data.delta, data.direction);

    return { id: data.task._id, delta: data.delta, _tmp: data._tmp };
  });
}

export {
  createTasks,
  getTasks,
  scoreTask,
  canNotEditTasks,
  getGroupFromTaskAndUser,
  getChallengeFromTask,
  groupSubscriptionNotFound,
  verifyTaskModification,
};
