import moment from 'moment';
import _ from 'lodash';
import * as Tasks from '../models/task';
import {
  BadRequest,
} from './errors';
import {
  SHARED_COMPLETION,
} from './groupTasks';
import shared from '../../common';

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
