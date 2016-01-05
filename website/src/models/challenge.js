import mongoose from 'mongoose';
import Q from 'q';
import validator from 'validator';
import baseModel from '../libs/api-v3/baseModel';
import _ from 'lodash';
import * as Tasks from './task';
import { model as User } from './user';

let Schema = mongoose.Schema;

let schema = new Schema({
  name: {type: String, required: true},
  shortName: {type: String, required: true}, // TODO what is it?
  description: String,
  official: {type: Boolean, default: false},
  tasksOrder: {
    habits: [{type: String, ref: 'Task'}],
    dailys: [{type: String, ref: 'Task'}],
    todos: [{type: String, ref: 'Task'}],
    rewards: [{type: String, ref: 'Task'}],
  },
  leader: {type: String, ref: 'User', validate: [validator.isUUID, 'Invalid uuid.'], required: true},
  group: {type: String, ref: 'Group', validate: [validator.isUUID, 'Invalid uuid.'], required: true},
  timestamp: {type: Date, default: Date.now, required: true}, // TODO what is this? use timestamps from plugin?
  memberCount: {type: Number, default: 0},
  prize: {type: Number, default: 0, min: 0},
});

schema.plugin(baseModel, {
  noSet: ['_id', 'memberCount', 'tasksOrder'],
});

// Takes a Task document and return a plain object of attributes that can be synced to the user
function _syncableAttrs (task) {
  let t = task.toObject(); // lodash doesn't seem to like _.omit on Document
  // only sync/compare important attrs
  let omitAttrs = ['userId', 'challenge', 'history', 'tags', 'completed', 'streak', 'notes']; // TODO what to do with updatedAt?
  if (t.type !== 'reward') omitAttrs.push('value');
  return _.omit(t, omitAttrs);
}

// Sync challenge to user, including tasks and tags.
// Used when user joins the challenge or to force sync.
schema.methods.syncToUser = async function syncChallengeToUser (user) {
  let challenge = this;
  challenge.shortName = challenge.shortName || challenge.name;

  // Add challenge to user.challenges
  if (!_.contains(user.challenges, challenge._id)) user.challenges.push(challenge._id);

  // Sync tags
  let userTags = user.tags;
  let i = _.findIndex(userTags, {_id: challenge._id});

  if (i !== -1) {
    if (userTags[i].name !== challenge.shortName) {
      // update the name - it's been changed since
      userTags[i].name = challenge.shortName;
    }
  } else {
    userTags.push({
      _id: challenge._id,
      name: challenge.shortName,
      challenge: true,
    });
  }

  let [challengeTasks, userTasks] = await Q.all([
    // Find original challenge tasks
    Tasks.Task.find({
      userId: {$exists: false},
      'challenge.id': challenge._id,
    }).exec(),
    // Find user's tasks linked to this challenge
    Tasks.Task.find({
      userId: user._id,
      'challenge.id': challenge._id,
    }).exec(),
  ]);

  let toSave = []; // An array of things to save

  challengeTasks.forEach(chalTask => {
    let matchingTask = _.find(userTasks, userTask => userTask.challenge.taskId === chalTask._id);

    if (!matchingTask) { // If the task is new, create it
      matchingTask = new Tasks[chalTask.type](Tasks.Task.sanitizeCreate(_syncableAttrs(chalTask)));
      matchingTask.challenge = {taskId: chalTask._id, id: challenge._id};
      matchingTask.userId = user._id;
      user.tasksOrder[`${chalTask.type}s`].push(matchingTask._id);
    } else {
      _.merge(matchingTask, _syncableAttrs(chalTask));
      // Make sure the task is in user.tasksOrder TODO necessary?
      let orderList = user.tasksOrder[`${chalTask.type}s`];
      if (orderList.indexOf(matchingTask._id) === -1 && (matchingTask.type !== 'todo' || !matchingTask.completed)) orderList.push(matchingTask._id);
    }

    if (!matchingTask.notes) matchingTask.notes = chalTask.notes; // don't override the notes, but provide it if not provided
    if (matchingTask.tags.indexOf(challenge._id) === -1) matchingTask.tags.push(challenge._id); // add tag if missing
    toSave.push(matchingTask.save());
  });

  // Flag deleted tasks as "broken"
  userTasks.forEach(userTask => {
    if (!_.find(challengeTasks, chalTask => chalTask._id === userTask.challenge.taskId)) {
      userTask.challenge.broken = 'TASK_DELETED';
      toSave.push(userTask.save());
    }
  });

  toSave.push(user.save());
  return Q.all(toSave);
};

async function _fetchMembersIds (challengeId) {
  return (await User.find({challenges: {$in: [challengeId]}}).select('_id').lean().exec()).map(member => member._id);
}

// Add a new task to challenge members
schema.methods.addTasks = async function challengeAddTasks (tasks) {
  let challenge = this;
  let membersIds = await _fetchMembersIds(challenge._id);

  // Sync each user sequentially
  for (let memberId of membersIds) {
    let updateTasksOrderQ = {$push: {}};
    let toSave = [];

    // TODO eslint complaints about ahving a function inside a loop -> make sure it works
    tasks.forEach(chalTask => { // eslint-disable-line no-loop-func
      let userTask = new Tasks[chalTask.type](Tasks.Task.sanitizeCreate(_syncableAttrs(chalTask)));
      userTask.challenge = {taskId: chalTask._id, id: challenge._id};
      userTask.userId = memberId;

      let tasksOrderList = updateTasksOrderQ.$push[`tasksOrder.${chalTask.type}s`];
      if (!tasksOrderList) {
        updateTasksOrderQ.$push[`tasksOrder.${chalTask.type}s`] = {
          $position: 0, // unshift
          $each: [userTask._id],
        };
      } else {
        tasksOrderList.$each.unshift(userTask._id);
      }

      toSave.push(userTask);
    });

    // Update the user
    toSave.unshift(User.update({_id: memberId}, updateTasksOrderQ).exec());
    await Q.all(toSave); // eslint-disable-line babel/no-await-in-loop
  }
};

// Sync updated task to challenge members
schema.methods.updateTask = async function challengeUpdateTask (task) {
  let challenge = this;

  let updateCmd = {$set: {}};

  _syncableAttrs(task).forEach((value, key) => {
    updateCmd.$set[key] = value;
  });

  // TODO reveiw
  // Updating instead of loading and saving for performances, risks becoming a problem if we introduce more complexity in tasks
  await Tasks.Task.update({
    userId: {$exists: true},
    'challenge.id': challenge.id,
    'challenge.taskId': task._id,
  }, updateCmd, {multi: true}).exec();
};

// Remove a task from challenge members
schema.methods.removeTask = async function challengeRemoveTask (task) {
  let challenge = this;

  // Remove the tasks from users' and map each of them to an update query to remove the task from tasksOrder
  let updateQueries = (await Tasks.Task.findOneAndRemove({
    userId: {$exists: true},
    'challenge.id': challenge.id,
    'challenge.taskId': task._id,
  }, {
    fields: {userId: 1, type: 1}, // fetch only what's necessary
  }).lean().exec())
    .map(removedTask => {
      return User.update({_id: removedTask.userId}, {
        $pull: {[`tasksOrder${removedTask.type}s`]: removedTask._id},
      });
    });

  // Execute each update sequentially
  for (let query of updateQueries) {
    await query.exec(); // eslint-disable-line babel/no-await-in-loop
  }
};

export let model = mongoose.model('Challenge', schema);
