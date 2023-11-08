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
 * Asynchronously creates tasks for a user, challenge, or group based on the provided request and options.
 * Validates the task type and data, sets the start date for 'daily' tasks, and updates the task order.
 * If no tasks are passed, it returns an empty array to avoid errors with mongo $push being empty.
 *
 * @async
 * @function createTasks
 * @param {Object} req - The request object, containing the tasks to be created in the body.
 * @param {Object} res - The response object.
 * @param {Object} [options={}] - Optional parameters.
 * @param {Object} options.user - The user for whom the tasks are being created.
 * @param {Object} options.challenge - The challenge for which the tasks are being created.
 * @param {Object} options.group - The group for which the tasks are being created.
 * @param {Boolean} options.requiresApproval - A boolean stating if the task will require approval.
 * @returns {Promise<Array>} A promise that resolves to an array of the created tasks.
 * @throws {BadRequest} If the task type is invalid.
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
 * Asynchronously retrieves tasks based on the provided request and options.
 *
 * @async
 * @function getTasks
 * @param {Object} req - The Express request variable, containing query parameters.
 * @param {Object} res - The Express response variable.
 * @param {Object} [options={}] - Optional parameters for task retrieval.
 * @param {Object} options.user - The user that these tasks belong to.
 * @param {Object} options.challenge - The challenge that these tasks belong to.
 * @param {Object} options.group - The group that these tasks belong to.
 * @param {Date} options.dueDate - The date to use for computing the nextDue field for each returned task.
 * @returns {Array} An array of tasks, ordered based on the user's task order preference.
 *
 * The function constructs a query based on the provided options and request query parameters.
 * It supports retrieving tasks for a specific challenge, group, or user. It also supports
 * retrieving tasks of a specific type (e.g., 'todos', 'completedTodos', '_allCompletedTodos').
 * The tasks are then ordered based on the user's task order preference.
 *
 * If a due date is provided, the function sets the next due date for each task.
 *
 * If any tasks in the user's task order do not exist, they are pruned from the task order.
 * Any unordered tasks are added to the end of the task order.
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

/**
 * Determines if a user cannot edit tasks within a group.
 *
 * @param {Object} group - The group object.
 * @param {Object} user - The user object.
 * @param {string} assignedUserId - The ID of the user to whom the task is assigned.
 * @returns {boolean} Returns true if the user is not the group leader, not a manager, and not assigning the task to themselves.
 */
function canNotEditTasks (group, user, assignedUserId) {
  const isNotGroupLeader = group.leader !== user._id;
  const isManager = Boolean(group.managers[user._id]);
  const userIsAssigningToSelf = Boolean(assignedUserId && user._id === assignedUserId);
  return isNotGroupLeader && !isManager && !userIsAssigningToSelf;
}

/**
 * Checks if a group's subscription is not found or has been terminated.
 *
 * @param {Object} group - The group object to check.
 * @property {Object} group.purchased - The purchased object of the group.
 * @property {Object} group.purchased.plan - The plan object of the purchased group.
 * @property {string} group.purchased.plan.customerId - The customer ID of the plan.
 * @property {Date} group.purchased.plan.dateTerminated - The termination date of the plan.
 * @returns {boolean} Returns true if the group, purchased object, plan, customerId are not found or if the plan has been terminated.
 */
function groupSubscriptionNotFound (group) {
  return !group || !group.purchased || !group.purchased.plan || !group.purchased.plan.customerId
   || (group.purchased.plan.dateTerminated && group.purchased.plan.dateTerminated < new Date());
}

/**
 * Retrieves a group based on a given task and user.
 * If the task belongs to a group and is not assigned to a user,
 * it fetches the group with its required fields and managers.
 *
 * @async
 * @function getGroupFromTaskAndUser
 * @param {Object} task - The task object.
 * @param {Object} user - The user object.
 * @returns {Promise<Object|null>} The group object or null if the task is assigned to a user or doesn't belong to a group.
 */
async function getGroupFromTaskAndUser (task, user) {
  if (task.group.id && !task.userId) {
    const fields = requiredGroupFields.concat(' managers');
    return Group.getGroup({ user, groupId: task.group.id, fields });
  }
  return null;
}

/**
 * Retrieves the challenge associated with a given task.
 *
 * @async
 * @function getChallengeFromTask
 * @param {Object} task - The task object.
 * @param {Object} task.challenge - The challenge object associated with the task.
 * @param {string} task.challenge.id - The ID of the challenge.
 * @param {string} task.userId - The ID of the user associated with the task.
 * @returns {Promise<Object|null>} The challenge object if it exists and the task is not associated with a user, otherwise null.
 */
async function getChallengeFromTask (task) {
  if (task.challenge.id && !task.userId) {
    return Challenge.findOne({ _id: task.challenge.id }).exec();
  }
  return null;
}

/**
 * Verifies if a task modification is valid based on the task, user, group, and challenge.
 * Throws an error if the task is not found, if the group is not found and the user is not authorized to edit tasks,
 * if the challenge is not found and the user is not authorized to modify it, or if the task is owned by a different user.
 *
 * @param {Object} task - The task to be modified.
 * @param {Object} user - The user attempting to modify the task.
 * @param {Object} group - The group that the task belongs to.
 * @param {Object} challenge - The challenge that the task is part of.
 * @param {Object} res - The response object.
 * @throws {NotFound} If the task, group, or challenge is not found.
 * @throws {NotAuthorized} If the user is not authorized to edit the task or modify the challenge.
 */
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

/**
 * Handles a challenge task. If the task is part of a challenge and is not broken or a reward,
 * it finds the corresponding challenge task and scores it. Any errors during this process are logged and do not interrupt the flow.
 *
 * @async
 * @function
 * @param {Object} task - The task to handle.
 * @param {Number} delta - The change in task value.
 * @param {String} direction - The direction of task scoring.
 * @throws {Error} If there is an error in scoring the challenge task.
 */
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

/**
 * Handles the scoring of a team task. If the task is part of a group and has a taskId,
 * it retrieves the team task and calculates the groupDelta based on the number of assigned users.
 * It then scores the challenge task based on the groupDelta and direction.
 * If the task type is 'daily' or 'todo', it handles shared completion.
 * Any errors during this process are caught and logged.
 *
 * @async
 * @function
 * @param {Object} task - The task to be handled.
 * @param {Number} delta - The change in score.
 * @param {String} direction - The direction of scoring ('up' or 'down').
 * @throws Will log the error and continue if an error occurs during the process.
 */
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
 * Asynchronously scores a task for a user. The function checks if the task is a 'daily' or 'todo' type and if it's completed or not.
 * It also checks if the user is authorized to score the task based on their role and the task's status.
 * If the task is part of a group, it retrieves the group details and checks if the user is a manager or leader.
 * The function then calculates the score delta and updates the task and user details accordingly.
 * If the task is a 'todo' type, it also updates the user's task order.
 * Finally, it sends a webhook notification and tracks the task scoring event for analytics.
 *
 * @async
 * @function scoreTask
 * @param {Object} user - The user who is scoring the task.
 * @param {Object} task - The task to be scored.
 * @param {string} direction - The direction of scoring ('up' or 'down').
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @throws {NotAuthorized} If the user is not authorized to score the task.
 * @throws {BadRequest} If the user is not a manager and tries to uncheck a task they did not complete.
 * @returns {Object} An object containing the updated task, score delta, scoring direction, task ids to pull and push, and temporary user data.
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

/**
 * Scores a list of tasks for a user. Validates the task scorings, retrieves the tasks, scores each task,
 * and saves the updated user and tasks. Handles todos removal or addition to the tasksOrder array.
 *
 * @async
 * @export
 * @param {Object} user - The user who is scoring the tasks.
 * @param {Array} taskScorings - An array of objects, each containing a task id and scoring direction ('up' or 'down').
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @throws {BadRequest} If taskScorings is not an array with at least one value, or if a taskScoring direction is not 'up' or 'down', or if a taskScoring id is not a string.
 * @throws {NotFound} If no tasks are found.
 * @returns {Array} An array of objects, each containing the id, delta, and _tmp of a scored task.
 */
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
