import mongoose from 'mongoose';
import Bluebird from 'bluebird';
import validator from 'validator';
import baseModel from '../libs/api-v3/baseModel';
import _ from 'lodash';
import * as Tasks from './task';
import { model as User } from './user';
import {
  model as Group,
  TAVERN_ID,
} from './group';
import { removeFromArray } from '../libs/api-v3/collectionManipulators';
import shared from '../../../common';
import { sendTxn as txnEmail } from '../libs/api-v3/email';
import sendPushNotification from '../libs/api-v3/pushNotifications';
import cwait from 'cwait';

const Schema = mongoose.Schema;

let schema = new Schema({
  name: {type: String, required: true},
  shortName: {type: String, required: true, minlength: 3},
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
  memberCount: {type: Number, default: 1},
  prize: {type: Number, default: 0, min: 0},
}, {
  strict: true,
  minimize: false, // So empty objects are returned
});

schema.plugin(baseModel, {
  noSet: ['_id', 'memberCount', 'tasksOrder'],
  timestamps: true,
});

// A list of additional fields that cannot be updated (but can be set on creation)
let noUpdate = ['group', 'official', 'shortName', 'prize'];
schema.statics.sanitizeUpdate = function sanitizeUpdate (updateObj) {
  return this.sanitize(updateObj, noUpdate);
};

// Returns true if user is a member of the challenge
schema.methods.isMember = function isChallengeMember (user) {
  return user.challenges.indexOf(this._id) !== -1;
};

// Returns true if the user can modify (close, selectWinner, ...) the challenge
schema.methods.canModify = function canModifyChallenge (user) {
  return user.contributor.admin || this.leader === user._id;
};

// Returns true if user has access to the challenge (can join)
schema.methods.hasAccess = function hasAccessToChallenge (user, group) {
  if (group.type === 'guild' && group.privacy === 'public') return true;
  return user.getGroups().indexOf(this.group) !== -1;
};

// Returns true if user can view the challenge
// Different from hasAccess because you can see challenges of groups you've been removed from if you're partecipating in them
schema.methods.canView = function canViewChallenge (user, group) {
  if (this.isMember(user)) return true;
  return this.hasAccess(user, group);
};

// Takes a Task document and return a plain object of attributes that can be synced to the user
function _syncableAttrs (task) {
  let t = task.toObject(); // lodash doesn't seem to like _.omit on Document
  // only sync/compare important attrs
  let omitAttrs = ['_id', 'userId', 'challenge', 'history', 'tags', 'completed', 'streak', 'notes', 'updatedAt'];
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
  let i = _.findIndex(userTags, {id: challenge._id});

  if (i !== -1) {
    if (userTags[i].name !== challenge.shortName) {
      // update the name - it's been changed since
      userTags[i].name = challenge.shortName;
    }
  } else {
    userTags.push({
      id: challenge._id,
      name: challenge.shortName,
      challenge: true,
    });
  }

  let [challengeTasks, userTasks] = await Bluebird.all([
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
      matchingTask = new Tasks[chalTask.type](Tasks.Task.sanitize(_syncableAttrs(chalTask)));
      matchingTask.challenge = {taskId: chalTask._id, id: challenge._id};
      matchingTask.userId = user._id;
      user.tasksOrder[`${chalTask.type}s`].push(matchingTask._id);
    } else {
      _.merge(matchingTask, _syncableAttrs(chalTask));
      // Make sure the task is in user.tasksOrder
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
  return Bluebird.all(toSave);
};

async function _fetchMembersIds (challengeId) {
  return (await User.find({challenges: {$in: [challengeId]}}).select('_id').lean().exec()).map(member => member._id);
}

async function _addTaskFn (challenge, tasks, memberId) {
  let updateTasksOrderQ = {$push: {}};
  let toSave = [];

  tasks.forEach(chalTask => {
    let userTask = new Tasks[chalTask.type](Tasks.Task.sanitize(_syncableAttrs(chalTask)));
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

    toSave.push(userTask.save({
      validateBeforeSave: false, // no user data supplied
    }));
  });

  // Update the user
  toSave.unshift(User.update({_id: memberId}, updateTasksOrderQ).exec());
  return await Bluebird.all(toSave);
}

// Add a new task to challenge members
schema.methods.addTasks = async function challengeAddTasks (tasks) {
  let challenge = this;
  let membersIds = await _fetchMembersIds(challenge._id);

  let queue = new cwait.TaskQueue(Bluebird, 25); // process only 5 users concurrently

  await Bluebird.map(membersIds, queue.wrap((memberId) => {
    return _addTaskFn(challenge, tasks, memberId);
  }));
};

// Sync updated task to challenge members
schema.methods.updateTask = async function challengeUpdateTask (task) {
  let challenge = this;

  let updateCmd = {$set: {}};

  let syncableAttrs = _syncableAttrs(task);
  for (let key in syncableAttrs) {
    updateCmd.$set[key] = syncableAttrs[key];
  }

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

  // Set the task as broken
  await Tasks.Task.update({
    userId: {$exists: true},
    'challenge.id': challenge.id,
    'challenge.taskId': task._id,
  }, {
    $set: {'challenge.broken': 'TASK_DELETED'},
  }, {multi: true}).exec();
};

// Unlink challenges tasks (and the challenge itself) from user. TODO rename to 'leave'
schema.methods.unlinkTasks = async function challengeUnlinkTasks (user, keep) {
  let challengeId = this._id;
  let findQuery = {
    userId: user._id,
    'challenge.id': challengeId,
  };

  removeFromArray(user.challenges, challengeId);

  if (keep === 'keep-all') {
    await Tasks.Task.update(findQuery, {
      $set: {challenge: {}},
    }, {multi: true}).exec();

    await user.save();
  } else { // keep = 'remove-all'
    let tasks = await Tasks.Task.find(findQuery).select('_id type completed').exec();
    let taskPromises = tasks.map(task => {
      // Remove task from user.tasksOrder and delete them
      if (task.type !== 'todo' || !task.completed) {
        removeFromArray(user.tasksOrder[`${task.type}s`], task._id);
      }

      return task.remove();
    });
    user.markModified('tasksOrder');
    taskPromises.push(user.save());
    return Bluebird.all(taskPromises);
  }
};

// TODO everything here should be moved to a worker
// actually even for a worker it's probably just too big and will kill mongo, figure out something else
schema.methods.closeChal = async function closeChal (broken = {}) {
  let challenge = this;

  let winner = broken.winner;
  let brokenReason = broken.broken;

  // Delete the challenge
  await this.model('Challenge').remove({_id: challenge._id}).exec();

  // Refund the leader if the challenge is closed and the group not the tavern
  if (challenge.group !== TAVERN_ID && brokenReason === 'CHALLENGE_DELETED') {
    await User.update({_id: challenge.leader}, {$inc: {balance: challenge.prize / 4}}).exec();
  }

  // Update the challengeCount on the group
  await Group.update({_id: challenge.group}, {$inc: {challengeCount: -1}}).exec();

  // Award prize to winner and notify
  if (winner) {
    winner.achievements.challenges.push(challenge.name);
    winner.balance += challenge.prize / 4;

    winner.addNotification('WON_CHALLENGE');

    let savedWinner = await winner.save();

    if (savedWinner.preferences.emailNotifications.wonChallenge !== false) {
      txnEmail(savedWinner, 'won-challenge', [
        {name: 'CHALLENGE_NAME', content: challenge.name},
      ]);
    }
    if (savedWinner.preferences.pushNotifications.wonChallenge !== false) {
      sendPushNotification(savedWinner,
        {
          title: challenge.name,
          message: shared.i18n.t('wonChallenge'),
          identifier: 'wonChallenge',
        });
    }
  }

  // Run some operations in the background withouth blocking the thread
  let backgroundTasks = [
    // And it's tasks
    Tasks.Task.remove({'challenge.id': challenge._id, userId: {$exists: false}}).exec(),
    // Set the challenge tag to non-challenge status and remove the challenge from the user's challenges
    User.update({
      challenges: challenge._id,
      'tags._id': challenge._id,
    }, {
      $set: {'tags.$.challenge': false},
      $pull: {challenges: challenge._id},
    }, {multi: true}).exec(),
    // Break users' tasks
    Tasks.Task.update({
      'challenge.id': challenge._id,
    }, {
      $set: {
        'challenge.broken': brokenReason,
        'challenge.winner': winner && winner.profile.name,
      },
    }, {multi: true}).exec(),
  ];

  Bluebird.all(backgroundTasks);
};

// Methods to adapt the new schema to API v2 responses (mostly tasks inside the challenge model)
// These will be removed once API v2 is discontinued

// Get all the tasks belonging to a challenge,
schema.methods.getTasks = function getChallengeTasks () {
  let args = Array.from(arguments);
  let cb;
  let type;

  if (args.length === 1) {
    cb = args[0];
  } else if (args.length > 1) {
    type = args[0];
    cb = args[1];
  } else {
    cb = function noop () {};
  }

  let query = {
    userId: {
      $exists: false,
    },

    'challenge.id': this._id,
  };

  if (type) query.type = type;

  return Tasks.Task.find(query, cb); // so we can use it as a promise
};

// Given challenge and an array of tasks and one of members return an API compatible challenge + tasks obj + members
schema.methods.addToChallenge = function addToChallenge (tasks, members) {
  let obj = this.toJSON();
  obj.members = members;

  let tasksOrder = obj.tasksOrder; // Saving a reference because we won't return it

  obj.habits = [];
  obj.dailys = [];
  obj.todos = [];
  obj.rewards = [];

  obj.tasksOrder = undefined;
  let unordered = [];

  tasks.forEach((task) => {
    // We want to push the task at the same position where it's stored in tasksOrder
    let pos = tasksOrder[`${task.type}s`].indexOf(task._id);
    if (pos === -1) { // Should never happen, it means the lists got out of sync
      unordered.push(task.toJSONV2());
    } else {
      obj[`${task.type}s`][pos] = task.toJSONV2();
    }
  });

  // Reconcile unordered items
  unordered.forEach((task) => {
    obj[`${task.type}s`].push(task);
  });

  // Remove null values that can be created when inserting tasks at an index > length
  ['habits', 'dailys', 'rewards', 'todos'].forEach((type) => {
    obj[type] = _.compact(obj[type]);
  });

  return obj;
};

// Return the data maintaining backward compatibility
schema.methods.getTransformedData = function getTransformedData (options) {
  let self = this;

  let cb = options.cb;
  let populateMembers = options.populateMembers;

  let queryMembers = {
    challenges: self._id,
  };

  let selectDataMembers = '_id';

  if (populateMembers) {
    selectDataMembers += ` ${populateMembers}`;
  }

  let membersQuery = User.find(queryMembers).select(selectDataMembers);
  if (options.limitPopulation) membersQuery.limit(15);

  Bluebird.all([
    membersQuery.exec(),
    self.getTasks(),
  ])
  .then((results) => {
    cb(null, self.addToChallenge(results[1], results[0]));
  })
  .catch(cb);
};

// END of API v2 methods

export let model = mongoose.model('Challenge', schema);
