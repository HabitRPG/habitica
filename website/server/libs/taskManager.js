import moment from 'moment';
import Bluebird from 'bluebird';
import _ from 'lodash';
import nconf from 'nconf';

import common from '../../common/';
import * as Tasks from '../models/task';
import {
  BadRequest,
} from './errors';

const shouldDo = common.shouldDo;
const scoreTask = common.ops.scoreTask;
const CRON_SAFE_MODE = nconf.get('CRON_SAFE_MODE') === 'true';
const CRON_SEMI_SAFE_MODE = nconf.get('CRON_SEMI_SAFE_MODE') === 'true';

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
    } else {
      newTask.userId = user._id;
    }

    // Validate that the task is valid and throw if it isn't
    // otherwise since we're saving user/challenge/group and task in parallel it could save the user/challenge/group with a tasksOrder that doens't match reality
    let validationErrors = newTask.validateSync();
    if (validationErrors) throw validationErrors;

    // Otherwise update the user/challenge/group
    owner.tasksOrder[`${taskType}s`].unshift(newTask._id);

    return newTask;
  });

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

export function ageDailies (user, daysMissed, dailies) {
  // For incomplete Dailys, add value (further incentive), deduct health, keep records for later decreasing the nightly mana gain
  let dailyCheckedAged = 0; // how many dailies were checked?
  let dailyDueUncheckedAged = 0; // how many dailies were un-checked?
  let atLeastOneDailyDueAged = false; // were any dailies due?
  if (!user.party.quest.progress.down) user.party.quest.progress.down = 0;
  let perfectAged = true;
  let now = moment();

  dailies.forEach((task) => {
    let scheduleMisses = 0;
    let EvadeTask = 0;

    let thatDay = moment(now).subtract({days: 1});

    if (shouldDo(thatDay.toDate(), task, user.preferences)) {
      atLeastOneDailyDueAged = true;
      scheduleMisses++;
      if (user.stats.buffs.stealth) {
        user.stats.buffs.stealth--;
        EvadeTask++;
      }
    }

    if (scheduleMisses <= EvadeTask) return;

    // The user did not complete this due Daily (but no penalty if cron is running in safe mode).
    if (CRON_SAFE_MODE) {
      dailyCheckedAged += 1; // allows full allotment of mp to be gained
      return;
    }

    perfectAged = false;

    if (task.checklist && task.checklist.length > 0) { // Partially completed checklists dock fewer mana points
      let fractionChecked = _.reduce(task.checklist, (m, i) => m + (i.completed ? 1 : 0), 0) / task.checklist.length;
      dailyDueUncheckedAged += 1 - fractionChecked;
      dailyCheckedAged += fractionChecked;
    } else {
      dailyDueUncheckedAged += 1;
    }

    let delta = scoreTask({
      user,
      task,
      direction: 'down',
      times: 1,
      cron: true,
    });

    if (!CRON_SEMI_SAFE_MODE) {
      // Apply damage from a boss, less damage for Trivial priority (difficulty)
      user.party.quest.progress.down += delta * (task.priority < 1 ? task.priority : 1);
      // NB: Medium and Hard priorities do not increase damage from boss. This was by accident
      // initially, and when we realised, we could not fix it because users are used to
      // their Medium and Hard Dailies doing an Easy amount of damage from boss.
      // Easy is task.priority = 1. Anything < 1 will be Trivial (0.1) or any future
      // setting between Trivial and Easy.
    }
  });

  return {dailyCheckedAged, dailyDueUncheckedAged, atLeastOneDailyDueAged, perfectAged};
}
