import _ from 'lodash';
import {
  requiredGroupFields,
  validateTaskAlias,
  setNextDue,
} from './utils';
import { model as Challenge } from '../../models/challenge';
import { model as Group } from '../../models/group';
import * as Tasks from '../../models/task';
import {
  BadRequest,
  NotFound,
  NotAuthorized,
} from '../errors';
import {
  SHARED_COMPLETION,
} from '../groupTasks';
import shared from '../../../common';


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
      if (taskData.requiresApproval) {
        newTask.group.approval.required = true;
      }
      newTask.group.sharedCompletion = taskData.sharedCompletion || SHARED_COMPLETION.default;
    } else {
      newTask.userId = user._id;

      // user.flags.welcomed is checked because when false it means the tasks being created
      // are the onboarding ones
      if (!user.achievements.createdTask && user.flags.welcomed) {
        user.addAchievement('createdTask');
        shared.onboarding.checkOnboardingStatus(user, req, res.analytics);
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

  await owner.update(taskOrderUpdateQuery).exec();

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

  let query = { userId: user._id };
  let limit;
  let sort;
  const owner = group || challenge || user;

  if (challenge) {
    query = { 'challenge.id': challenge.id, userId: { $exists: false } };
  } else if (group) {
    query = { 'group.id': group._id, userId: { $exists: false } };
  }

  const { type } = req.query;

  if (type) {
    if (type === 'todos') {
      query.completed = false; // Exclude completed todos
      query.type = 'todo';
    } else if (type === 'completedTodos' || type === '_allCompletedTodos') { // _allCompletedTodos is currently in BETA and is likely to be removed in future
      limit = 30;

      if (type === '_allCompletedTodos') {
        limit = 0; // no limit
      }

      query.type = 'todo';
      query.completed = true;

      if (owner._id === user._id) {
        query.userId = user._id;
      }

      sort = {
        dateCompleted: -1,
      };
    } else {
      query.type = type.slice(0, -1); // removing the final "s"
    }
  } else {
    query.$or = [ // Exclude completed todos
      { type: 'todo', completed: false },
      { type: { $in: ['habit', 'daily', 'reward'] } },
    ];
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
    } else {
      orderedTasks[i] = task;
    }
  });

  // Remove empty values from the array and add any unordered task
  orderedTasks = _.compact(orderedTasks).concat(unorderedTasks);
  return orderedTasks;
}


function canNotEditTasks (group, user, assignedUserId) {
  const isNotGroupLeader = group.leader !== user._id;
  const isManager = Boolean(group.managers[user._id]);
  const userIsAssigningToSelf = Boolean(assignedUserId && user._id === assignedUserId);
  return isNotGroupLeader && !isManager && !userIsAssigningToSelf;
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
    throw new NotFound(res.t('taskNotFound'));
  } else if (task.group.id && !task.userId) {
    if (!group) throw new NotFound(res.t('groupNotFound'));
    if (canNotEditTasks(group, user)) throw new NotAuthorized(res.t('onlyGroupLeaderCanEditTasks'));

  // If the task belongs to a challenge make sure the user has rights
  } else if (task.challenge.id && !task.userId) {
    if (!challenge) throw new NotFound(res.t('challengeNotFound'));
    if (!challenge.canModify(user)) throw new NotAuthorized(res.t('onlyChalLeaderEditTasks'));

  // If the task is owned by a user make it's the current one
  } else if (task.userId !== user._id) {
    throw new NotFound(res.t('taskNotFound'));
  }
}

export {
  createTasks,
  getTasks,
  canNotEditTasks,
  getGroupFromTaskAndUser,
  getChallengeFromTask,
  verifyTaskModification,
};
