import mongoose from 'mongoose';
import Q from 'q';
import validator from 'validator';
import baseModel from '../libs/api-v3/baseModel';
import _ from 'lodash';
import * as Tasks from './task';

let Schema = mongoose.Schema;

let schema = new Schema({
  name: {type: String, required: true},
  shortName: {type: String, required: true}, // TODO what is it?
  description: String,
  official: {type: Boolean, default: false}, // TODO only settable by admin
  tasksOrder: {
    habits: [{type: String, ref: 'Task'}],
    dailys: [{type: String, ref: 'Task'}],
    todos: [{type: String, ref: 'Task'}],
    rewards: [{type: String, ref: 'Task'}],
  },
  leader: {type: String, ref: 'User', validate: [validator.isUUID, 'Invalid uuid.'], required: true},
  groupId: {type: String, ref: 'Group', validate: [validator.isUUID, 'Invalid uuid.'], required: true},
  timestamp: {type: Date, default: Date.now, required: true}, // TODO what is this? use timestamps from plugin? not settable?
  memberCount: {type: Number, default: 0},
  challengeCount: {type: Number, default: 0},
  prize: {type: Number, default: 0, min: 0}, // TODO no update?
});

schema.plugin(baseModel, {
  noSet: ['_id', 'memberCount', 'challengeCount', 'tasksOrder'],
});


// Syncing logic

function _syncableAttrs (task) {
  let t = task.toObject(); // lodash doesn't seem to like _.omit on EmbeddedDocument
  // only sync/compare important attrs
  let omitAttrs = ['userId', 'challenge', 'history', 'tags', 'completed', 'streak', 'notes']; // TODO use whitelist instead of blacklist?
  if (t.type !== 'reward') omitAttrs.push('value');
  return _.omit(t, omitAttrs);
}

// TODO redo
// Compare whether any changes have been made to tasks. If so, we'll want to sync those changes to subscribers
/* function comparableData(obj) {
  return JSON.stringify(
    _(obj.habits.concat(obj.dailys).concat(obj.todos).concat(obj.rewards))
      .sortBy('id') // we don't want to update if they're sort-order is different
      .transform(function(result, task){
        result.push(syncableAttrs(task));
      })
      .value())
}

ChallengeSchema.methods.isOutdated = function isChallengeOutdated (newData) {
  return comparableData(this) !== comparableData(newData);
}*/

// Syncs all new tasks, deleted tasks, etc to the user object
schema.methods.syncToUser = function syncChallengeToUser (user) {
  if (!user) throw new Error('User required.');

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

  // Sync new tasks and updated tasks
  return Q.all([
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
  ])
  .then(results => {
    let challengeTasks = results[0];
    let userTasks = results[1];
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
  });
};

export let model = mongoose.model('Challenge', schema);
