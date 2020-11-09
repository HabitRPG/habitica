import moment from 'moment';
import _ from 'lodash';
import validator from 'validator';
import * as Tasks from '../models/task';
import apiError from './apiError';
import {
  BadRequest,
  NotAuthorized,
  NotFound,
} from './errors';
import {
  SHARED_COMPLETION,
  handleSharedCompletion,
} from './groupTasks';
import shared from '../../common';
import { model as Group } from '../models/group'; // eslint-disable-line import/no-cycle
import { model as User } from '../models/user'; // eslint-disable-line import/no-cycle
import { taskScoredWebhook } from './webhook'; // eslint-disable-line import/no-cycle

import logger from './logger';

const requiredGroupFields = '_id leader tasksOrder name';

async function _validateTaskAlias (tasks, res) {
  const tasksWithAliases = tasks.filter(task => task.alias);
  const aliases = tasksWithAliases.map(task => task.alias);

  // Compares the short names in tasks against
  // a Set, where values cannot repeat. If the
  // lengths are different, some name was duplicated
  if (aliases.length !== [...new Set(aliases)].length) {
    throw new BadRequest(res.t('taskAliasAlreadyUsed'));
  }

  await Promise.all(tasksWithAliases.map(task => task.validate()));
}

export function setNextDue (task, user, dueDateOption) {
  if (task.type !== 'daily') return;

  let now = moment().toDate();
  let dateTaskIsDue = Date.now();
  if (dueDateOption) {
    // @TODO Add required ISO format
    dateTaskIsDue = moment(dueDateOption);

    // If not time is supplied. Let's assume we want start of Custom Day Start day.
    if (
      dateTaskIsDue.hour() === 0
      && dateTaskIsDue.minute() === 0
      && dateTaskIsDue.second() === 0
      && dateTaskIsDue.millisecond() === 0
    ) {
      dateTaskIsDue.add(user.preferences.timezoneOffset, 'minutes');
      dateTaskIsDue.add(user.preferences.dayStart, 'hours');
    }

    now = dateTaskIsDue;
  }

  const optionsForShouldDo = user.preferences.toObject();
  optionsForShouldDo.now = now;
  task.isDue = shared.shouldDo(dateTaskIsDue, task, optionsForShouldDo);

  optionsForShouldDo.nextDue = true;
  const nextDue = shared.shouldDo(dateTaskIsDue, task, optionsForShouldDo);
  if (nextDue && nextDue.length > 0) {
    task.nextDue = nextDue.map(dueDate => dueDate.toISOString());
  }
}

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
export async function createTasks (req, res, options = {}) {
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
  await _validateTaskAlias(toSave, res);

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
export async function getTasks (req, res, options = {}) {
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
  if (type && type !== 'completedTodos' && type !== '_allCompletedTodos') {
    const order = owner.tasksOrder[type];
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
  return tasks;
}

// Takes a Task document and return a plain object of attributes that can be synced to the user
export function syncableAttrs (task) {
  const t = task.toObject(); // lodash doesn't seem to like _.omit on Document
  // only sync/compare important attrs
  const omitAttrs = ['_id', 'userId', 'challenge', 'history', 'tags', 'completed', 'streak', 'notes', 'updatedAt', 'createdAt', 'group', 'checklist', 'attribute'];
  if (t.type !== 'reward') omitAttrs.push('value');
  return _.omit(t, omitAttrs);
}

/**
 * Moves a task to a specified position.
 *
 * @param  order  The list of ordered tasks
 * @param  taskId  The Task._id of the task to move
 * @param  to A integer specifying the index to move the task to
 *
 * @return Empty
 */
export function moveTask (order, taskId, to) {
  const currentIndex = order.indexOf(taskId);

  // If for some reason the task isn't ordered (should never happen), push it in the new position
  // if the task is moved to a non existing position
  // or if the task is moved to position -1 (push to bottom)
  // -> push task at end of list
  if (!order[to] && to !== -1) {
    order.push(taskId);
    return;
  }

  if (currentIndex !== -1) order.splice(currentIndex, 1);
  if (to === -1) {
    order.push(taskId);
  } else {
    order.splice(to, 0, taskId);
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

async function handleGroupTask (task, delta, direction) {
  if (task.group && task.group.taskId) {
    // Wrapping everything in a try/catch block because if an error occurs
    // using `await` it MUST NOT bubble up because the request has already been handled
    try {
      const groupTask = await Tasks.Task.findOne({
        _id: task.group.taskId,
      }).exec();

      if (groupTask) {
        await handleSharedCompletion(groupTask, task);

        const groupDelta = groupTask.group.assignedUsers
          ? delta / groupTask.group.assignedUsers.length
          : delta;
        await groupTask.scoreChallengeTask(groupDelta, direction);
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
    if (task.completed && direction === 'up') {
      throw new NotAuthorized(res.t('sessionOutdated'));
    } else if (!task.completed && direction === 'down') {
      throw new NotAuthorized(res.t('sessionOutdated'));
    }
  }

  if (task.group.approval.required && !task.group.approval.approved) {
    const fields = requiredGroupFields.concat(' managers');
    const group = await Group.getGroup({ user, groupId: task.group.id, fields });

    const managerIds = Object.keys(group.managers);
    managerIds.push(group.leader);

    if (managerIds.indexOf(user._id) !== -1) {
      task.group.approval.approved = true;
      task.group.approval.requested = true;
      task.group.approval.requestedDate = new Date();
    } else {
      if (task.group.approval.requested) {
        return {
          task,
          requiresApproval: true,
          message: res.t('taskRequiresApproval'),
        };
      }

      task.group.approval.requested = true;
      task.group.approval.requestedDate = new Date();

      const managers = await User.find({ _id: managerIds }, 'notifications preferences').exec(); // Use this method so we can get access to notifications

      // @TODO: we can use the User.pushNotification function because
      // we need to ensure notifications are translated
      const managerPromises = [];
      managers.forEach(manager => {
        manager.addNotification('GROUP_TASK_APPROVAL', {
          message: res.t('userHasRequestedTaskApproval', {
            user: user.profile.name,
            taskName: task.text,
          }, manager.preferences.language),
          groupId: group._id,
          // user task id, used to match the notification when the task is approved
          taskId: task._id,
          userId: user._id,
          groupTaskId: task.group.taskId, // the original task id
          direction,
        });
        managerPromises.push(manager.save());
      });

      managerPromises.push(task.save());
      await Promise.all(managerPromises);

      return {
        task,
        requiresApproval: true,
        message: res.t('taskApprovalHasBeenRequested'),
      };
    }
  }

  if (task.group.approval.required && task.group.approval.approved) {
    const notificationIndex = user.notifications.findIndex(notification => notification
       && notification.data && notification.data.task
       && notification.data.task._id === task._id && notification.type === 'GROUP_TASK_APPROVED');

    if (notificationIndex !== -1) {
      user.notifications.splice(notificationIndex, 1);
    }
  }

  const wasCompleted = task.completed;

  const firstTask = !user.achievements.completedTask;
  const [delta] = shared.ops.scoreTask({ task, user, direction }, req, res.analytics);
  // Drop system (don't run on the client,
  // as it would only be discarded since ops are sent to the API, not the results)
  if (direction === 'up' && !firstTask) shared.fns.randomDrop(user, { task, delta }, req, res.analytics);

  // If a todo was completed or uncompleted move it in or out of the user.tasksOrder.todos list
  // TODO move to common code?
  let pullTask = false;
  let pushTask = false;
  if (task.type === 'todo') {
    if (!wasCompleted && task.completed) {
      // @TODO: mongoose's push and pull should be atomic and help with
      // our concurrency issues. If not, we need to use this update $pull and $push
      pullTask = true;
      // user.tasksOrder.todos.pull(task._id);
    } else if (
      wasCompleted
      && !task.completed
      && user.tasksOrder.todos.indexOf(task._id) === -1
    ) {
      pushTask = true;
      // user.tasksOrder.todos.push(task._id);
    }
  }

  setNextDue(task, user);

  taskScoredWebhook.send(user, {
    task,
    direction,
    delta,
    user,
  });

  // Track when new users (first 7 days) score tasks
  if (moment().diff(user.auth.timestamps.created, 'days') < 7) {
    res.analytics.track('task score', {
      uuid: user._id,
      hitType: 'event',
      category: 'behavior',
      taskType: task.type,
      direction,
      headers: req.headers,
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
    _tmp: _.cloneDeep(user._tmp),
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

  if (Object.keys(tasks).length === 0) throw new NotFound(res.t('taskNotFound'));

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
    if (returnData.pushTask === true) pushIDs.push(returnData.task._id);
    if (returnData.pullTask === true) pullIDs.push(returnData.task._id);
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
    handleGroupTask(data.task, data.delta, data.direction);

    // Handle group tasks that require approval
    if (data.requiresApproval === true) {
      return {
        id: data.task._id, message: data.message, requiresApproval: true,
      };
    }

    return { id: data.task._id, delta: data.delta, _tmp: data._tmp };
  });
}
