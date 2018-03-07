import moment from 'moment';
import * as Tasks from '../models/task';
import {
  BadRequest,
} from './errors';
import Bluebird from 'bluebird';
import _ from 'lodash';
import shared from '../../common';

async function _validateTaskAlias (tasks, res) {
  let tasksWithAliases = tasks.filter(task => task.alias);
  let aliases = tasksWithAliases.map(task => task.alias);

  // Compares the short names in tasks against
  // a Set, where values cannot repeat. If the
  // lengths are different, some name was duplicated
  if (aliases.length !== [...new Set(aliases)].length) {
    throw new BadRequest(res.t('taskAliasAlreadyUsed'));
  }

  await Bluebird.map(tasksWithAliases, (task) => {
    return task.validate();
  });
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

  let taskOrderToAdd = {};

  toSave = toSave.map(taskData => {
    // Validate that task.type is valid
    if (!taskData || Tasks.tasksTypes.indexOf(taskData.type) === -1) throw new BadRequest(res.t('invalidTaskType'));

    let taskType = taskData.type;
    let newTask = new Tasks[taskType](Tasks.Task.sanitize(taskData));

    // Attempt to round priority
    if (newTask.priority && !Number.isNaN(Number.parseFloat(newTask.priority))) {
      newTask.priority = Number(newTask.priority.toFixed(1));
    }

    if (challenge) {
      newTask.challenge.id = challenge.id;
    } else if (group) {
      newTask.group.id = group._id;
      if (taskData.requiresApproval) {
        newTask.group.approval.required = true;
      }
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

  // tasks with aliases need to be validated asyncronously
  await _validateTaskAlias(toSave, res);

  toSave = toSave.map(task => task.save({ // If all tasks are valid (this is why it's not in the previous .map()), save everything, withough running validation again
    validateBeforeSave: false,
  }));

  toSave.unshift(owner.save());

  let tasks = await Bluebird.all(toSave);
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

      query = {
        userId: user._id,
        type: 'todo',
        completed: true,
      };

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
