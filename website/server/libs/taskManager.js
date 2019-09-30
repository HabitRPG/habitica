import moment from 'moment';
import * as Tasks from '../models/task';
import {
  BadRequest,
  NotAuthorized,
  NotFound,
} from './errors';
import {
  SHARED_COMPLETION,
} from './groupTasks';
import _ from 'lodash';
import shared from '../../common';
import { model as Group } from '../models/group';
import { model as User } from '../models/user';
import { taskScoredWebhook } from './webhook';
import { handleSharedCompletion } from './groupTasks';
import logger from './logger';
import validator from 'validator';

let requiredGroupFields = '_id leader tasksOrder name';

async function _validateTaskAlias (tasks, res) {
  let tasksWithAliases = tasks.filter(task => task.alias);
  let aliases = tasksWithAliases.map(task => task.alias);

  // Compares the short names in tasks against
  // a Set, where values cannot repeat. If the
  // lengths are different, some name was duplicated
  if (aliases.length !== [...new Set(aliases)].length) {
    throw new BadRequest(res.t('taskAliasAlreadyUsed'));
  }

  await Promise.all(tasksWithAliases.map((task) => {
    return task.validate();
  }));
}

export function setNextDue (task, user, dueDateOption) {
  if (task.type !== 'daily') return;

  let now = moment().toDate();
  let dateTaskIsDue = Date.now();
  if (dueDateOption) {
    // @TODO Add required ISO format
    dateTaskIsDue = moment(dueDateOption);

    // If not time is supplied. Let's assume we want start of Custom Day Start day.
    if (dateTaskIsDue.hour() === 0 && dateTaskIsDue.minute() === 0 && dateTaskIsDue.second() === 0 && dateTaskIsDue.millisecond() === 0) {
      dateTaskIsDue.add(user.preferences.timezoneOffset, 'minutes');
      dateTaskIsDue.add(user.preferences.dayStart, 'hours');
    }

    now = dateTaskIsDue;
  }


  let optionsForShouldDo = user.preferences.toObject();
  optionsForShouldDo.now = now;
  task.isDue = shared.shouldDo(dateTaskIsDue, task, optionsForShouldDo);

  optionsForShouldDo.nextDue = true;
  let nextDue = shared.shouldDo(dateTaskIsDue, task, optionsForShouldDo);
  if (nextDue && nextDue.length > 0) {
    task.nextDue = nextDue.map((dueDate) => {
      return dueDate.toISOString();
    });
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
  let {
    user,
    challenge,
    group,
  } = options;

  let owner = group || challenge || user;

  let toSave = Array.isArray(req.body) ? req.body : [req.body];

  // Return if no tasks are passed, avoids errors with mongo $push being empty
  if (toSave.length === 0) return [];

  let taskOrderToAdd = {};

  toSave = toSave.map(taskData => {
    // Validate that task.type is valid
    if (!taskData || Tasks.tasksTypes.indexOf(taskData.type) === -1) throw new BadRequest(res.t('invalidTaskType'));

    let taskType = taskData.type;
    let newTask = new Tasks[taskType](Tasks.Task.sanitize(taskData));

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
    }

    setNextDue(newTask, user);

    // Validate that the task is valid and throw if it isn't
    // otherwise since we're saving user/challenge/group and task in parallel it could save the user/challenge/group with a tasksOrder that doens't match reality
    let validationErrors = newTask.validateSync();
    if (validationErrors) throw validationErrors;

    // Otherwise update the user/challenge/group
    if (!taskOrderToAdd[`${taskType}s`]) taskOrderToAdd[`${taskType}s`] = [];
    taskOrderToAdd[`${taskType}s`].unshift(newTask._id);

    return newTask;
  });

  // Push all task ids
  let taskOrderUpdateQuery = {$push: {}};
  for (let taskType in taskOrderToAdd) {
    taskOrderUpdateQuery.$push[`tasksOrder.${taskType}`] = {
      $each: taskOrderToAdd[taskType],
      $position: 0,
    };
  }

  await owner.update(taskOrderUpdateQuery).exec();

  // tasks with aliases need to be validated asynchronously
  await _validateTaskAlias(toSave, res);

  toSave = toSave.map(task => task.save({ // If all tasks are valid (this is why it's not in the previous .map()), save everything, withough running validation again
    validateBeforeSave: false,
  }));

  toSave.unshift(owner.save());

  let tasks = await Promise.all(toSave);
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
  let {
    user,
    challenge,
    group,
    dueDate,
  } = options;

  let query = {userId: user._id};
  let limit;
  let sort;
  let owner = group || challenge || user;

  if (challenge) {
    query =  {'challenge.id': challenge.id, userId: {$exists: false}};
  } else if (group) {
    query =  {'group.id': group._id, userId: {$exists: false}};
  }

  let type = req.query.type;

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
      {type: 'todo', completed: false},
      {type: {$in: ['habit', 'daily', 'reward']}},
    ];
  }

  let mQuery = Tasks.Task.find(query);
  if (limit) mQuery.limit(limit);
  if (sort) mQuery.sort(sort);

  let tasks = await mQuery.exec();

  if (dueDate) {
    tasks.forEach((task) => {
      setNextDue(task, user, dueDate);
    });
  }

  // Order tasks based on tasksOrder
  if (type && type !== 'completedTodos' && type !== '_allCompletedTodos') {
    let order = owner.tasksOrder[type];
    let orderedTasks = new Array(tasks.length);
    let unorderedTasks = []; // what we want to add later

    tasks.forEach((task, index) => {
      let taskId = task._id;
      let i = order[index] === taskId ? index : order.indexOf(taskId);
      if (i === -1) {
        unorderedTasks.push(task);
      } else {
        orderedTasks[i] = task;
      }
    });

    // Remove empty values from the array and add any unordered task
    orderedTasks = _.compact(orderedTasks).concat(unorderedTasks);
    return orderedTasks;
  } else {
    return tasks;
  }
}

// Takes a Task document and return a plain object of attributes that can be synced to the user

export function syncableAttrs (task) {
  let t = task.toObject(); // lodash doesn't seem to like _.omit on Document
  // only sync/compare important attrs
  let omitAttrs = ['_id', 'userId', 'challenge', 'history', 'tags', 'completed', 'streak', 'notes', 'updatedAt', 'createdAt', 'group', 'checklist', 'attribute'];
  if (t.type !== 'reward') omitAttrs.push('value');
  return _.omit(t, omitAttrs);
}

/**
 * Moves a task to a specified position.
 *
 * @param  order  The list of ordered tasks
 * @param  taskId  The Task._id of the task to move
 * @param  to A integer specifiying the index to move the task to
 *
 * @return Empty
 */
export function moveTask (order, taskId, to) {
  let currentIndex = order.indexOf(taskId);

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
    let fields = requiredGroupFields.concat(' managers');
    let group = await Group.getGroup({user, groupId: task.group.id, fields});

    let managerIds = Object.keys(group.managers);
    managerIds.push(group.leader);

    if (managerIds.indexOf(user._id) !== -1) {
      task.group.approval.approved = true;
      task.group.approval.requested = true;
      task.group.approval.requestedDate = new Date();
    } else {
      if (task.group.approval.requested) {
        throw new NotAuthorized(res.t('taskRequiresApproval'));
      }

      task.group.approval.requested = true;
      task.group.approval.requestedDate = new Date();

      let managers = await User.find({_id: managerIds}, 'notifications preferences').exec(); // Use this method so we can get access to notifications

      // @TODO: we can use the User.pushNotification function because we need to ensure notifications are translated
      let managerPromises = [];
      managers.forEach((manager) => {
        manager.addNotification('GROUP_TASK_APPROVAL', {
          message: res.t('userHasRequestedTaskApproval', {
            user: user.profile.name,
            taskName: task.text,
          }, manager.preferences.language),
          groupId: group._id,
          taskId: task._id, // user task id, used to match the notification when the task is approved
          userId: user._id,
          groupTaskId: task.group.taskId, // the original task id
          direction,
        });
        managerPromises.push(manager.save());
      });

      managerPromises.push(task.save());
      await Promise.all(managerPromises);

      throw new NotAuthorized(res.t('taskApprovalHasBeenRequested'));
    }
  }
  let wasCompleted = task.completed;

  let [delta] = shared.ops.scoreTask({task, user, direction}, req);
  // Drop system (don't run on the client, as it would only be discarded since ops are sent to the API, not the results)
  if (direction === 'up') shared.fns.randomDrop(user, {task, delta}, req, res.analytics);

  // If a todo was completed or uncompleted move it in or out of the user.tasksOrder.todos list
  // TODO move to common code?
  let taskOrderPromise;
  let pullTask = false;
  let pushTask = false;
  if (task.type === 'todo') {
    if (!wasCompleted && task.completed) {
      // @TODO: mongoose's push and pull should be atomic and help with
      // our concurrency issues. If not, we need to use this update $pull and $push
      pullTask = true;
      // user.tasksOrder.todos.pull(task._id);
    } else if (wasCompleted && !task.completed && user.tasksOrder.todos.indexOf(task._id) === -1) {
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
  return {user, task, delta, direction, taskOrderPromise, pullTask, pushTask, _tmp: _.cloneDeep(user._tmp)};
}

async function handleChallengeTask (task, delta, direction) {
  if (task.challenge && task.challenge.id && task.challenge.taskId && !task.challenge.broken && task.type !== 'reward') {
    // Wrapping everything in a try/catch block because if an error occurs using `await` it MUST NOT bubble up because the request has already been handled
    try {
      const chalTask = await Tasks.Task.findOne({
        _id: task.challenge.taskId,
      }).exec();

      if (!chalTask) return;

      await chalTask.scoreChallengeTask(delta, direction);
    } catch (e) {
      logger.error(e);
    }
  }
}

async function handleGroupTask (task, delta, direction) {
  if (task.group && task.group.taskId) {
    await handleSharedCompletion(task);
    try {
      const groupTask = await Tasks.Task.findOne({
        _id: task.group.taskId,
      }).exec();

      if (groupTask) {
        const groupDelta = groupTask.group.assignedUsers ? delta / groupTask.group.assignedUsers.length : delta;
        await groupTask.scoreChallengeTask(groupDelta, direction);
      }
    } catch (e) {
      logger.error(e);
    }
  }
}

export async function scoreTasks (user, taskScorings, req, res) {
  let taskIds = taskScorings.map(taskScoring => taskScoring.id).filter(id => id !== undefined);
  if (taskIds.length === 0) throw new BadRequest(res.t('taskNotFound'));
  let tasks = {};
  (await Tasks.Task.findMultipleByIdOrAlias(taskIds, user._id)).forEach(task => {
    tasks[task._id] = task;
    if (task.alias) {
      tasks[task.alias] = task;
    }
  });
  if (Object.keys(tasks).length === 0) throw new NotFound(res.t('taskNotFound'));
  let scorePromises = [];
  taskScorings.forEach(taskScoring => {
    if (tasks[taskScoring.id]) {
      scorePromises.push(scoreTask(user, tasks[taskScoring.id], taskScoring.direction, req, res));
    }
  });
  let returnDatas = await Promise.all(scorePromises);

  let savePromises = [returnDatas[returnDatas.length - 1].user.save()];
  let pullIDs = [];
  let pushIDs = [];
  returnDatas.forEach(returnData => {
    if (returnData.pushTask) pushIDs.push(returnData.task._id);
    if (returnData.pullTask) pullIDs.push(returnData.task._id);
  });
  let moveUpdateObject = {};
  if (pushIDs.length > 0) moveUpdateObject.$push = { 'tasksOrder.todos': { $each: pushIDs} };
  if (pullIDs.length > 0) moveUpdateObject.$pull = { 'tasksOrder.todos': { $in: pullIDs} };
  if (pushIDs.length > 0 || pullIDs.length > 0) savePromises.push(user.updateOne(moveUpdateObject).exec());
  Object.keys(tasks).forEach(identifier => {
    if (validator.isUUID(String(identifier))) {
      savePromises.push(tasks[identifier].save());
    }
  });
  // Save results and handle request
  let results = await Promise.all(savePromises);

  const response = {user: results[0], taskResponses: []};

  response.taskResponses = returnDatas.map(data => {
    // Handle challenge tasks here so we save on one for loop
    handleChallengeTask(data.task, data.delta, data.direction);
    handleGroupTask(data.task, data.delta, data.direction);

    return {id: data.task._id, delta: data.delta, _tmp: data._tmp};
  });
  return response;
}
