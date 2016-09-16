import * as Tasks from '../models/task';
import {
  BadRequest,
} from './errors';
import Bluebird from 'bluebird';
import _ from 'lodash';

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
      let limit = 30;

      if (type === '_allCompletedTodos') {
        limit = 0; // no limit
      }
      query = Tasks.Task.find({
        userId: user._id,
        type: 'todo',
        completed: true,
      }).limit(limit).sort({
        dateCompleted: -1,
      });
    } else {
      query.type = type.slice(0, -1); // removing the final "s"
    }
  } else {
    query.$or = [ // Exclude completed todos
      {type: 'todo', completed: false},
      {type: {$in: ['habit', 'daily', 'reward']}},
    ];
  }

  let tasks = await Tasks.Task.find(query).exec();

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
  let omitAttrs = ['_id', 'userId', 'challenge', 'history', 'tags', 'completed', 'streak', 'notes', 'updatedAt', 'group', 'checklist'];
  if (t.type !== 'reward') omitAttrs.push('value');
  return _.omit(t, omitAttrs);
}
