import mongoose from 'mongoose';
import validator from 'validator';
import baseModel from '../libs/baseModel';
import _ from 'lodash';
import * as Tasks from './task';
import { model as User } from './user';
import {
  model as Group,
} from './group';
import { removeFromArray } from '../libs/collectionManipulators';
import shared from '../../common';
import { sendTxn as txnEmail } from '../libs/email';
import { sendNotification as sendPushNotification } from '../libs/pushNotifications';
import { TaskQueue } from 'cwait';
import { syncableAttrs, setNextDue } from '../libs/taskManager';

const Schema = mongoose.Schema;

const MIN_SHORTNAME_SIZE_FOR_CHALLENGES = shared.constants.MIN_SHORTNAME_SIZE_FOR_CHALLENGES;
const MAX_SUMMARY_SIZE_FOR_CHALLENGES = shared.constants.MAX_SUMMARY_SIZE_FOR_CHALLENGES;

let schema = new Schema({
  name: {$type: String, required: true},
  shortName: {$type: String, required: true, minlength: MIN_SHORTNAME_SIZE_FOR_CHALLENGES},
  summary: {$type: String, maxlength: MAX_SUMMARY_SIZE_FOR_CHALLENGES},
  description: String,
  official: {$type: Boolean, default: false},
  tasksOrder: {
    habits: [{$type: String, ref: 'Task'}],
    dailys: [{$type: String, ref: 'Task'}],
    todos: [{$type: String, ref: 'Task'}],
    rewards: [{$type: String, ref: 'Task'}],
  },
  leader: {$type: String, ref: 'User', validate: [v => validator.isUUID(v), 'Invalid uuid.'], required: true},
  group: {$type: String, ref: 'Group', validate: [v => validator.isUUID(v), 'Invalid uuid.'], required: true},
  memberCount: {$type: Number, default: 0},
  prize: {$type: Number, default: 0, min: 0},
  categories: [{
    slug: {$type: String},
    name: {$type: String},
  }],
}, {
  strict: true,
  minimize: false, // So empty objects are returned
  typeKey: '$type', // So that we can use fields named `type`
});

schema.plugin(baseModel, {
  noSet: ['_id', 'memberCount', 'tasksOrder'],
  timestamps: true,
});

schema.pre('init', function ensureSummaryIsFetched (chal) {
  // The Vue website makes the summary be mandatory for all new challenges, but the
  // Angular website did not, and the API does not yet for backwards-compatibilty.
  // When any challenge without a summary is fetched from the database, this code
  // supplies the name as the summary. This can be removed when all challenges have
  // a summary and the API makes it mandatory (a breaking change!)
  if (!chal.summary) {
    chal.summary = chal.name ? chal.name.substring(0, MAX_SUMMARY_SIZE_FOR_CHALLENGES) : ' ';
  }
});

// A list of additional fields that cannot be updated (but can be set on creation)
let noUpdate = ['group', 'leader', 'official', 'shortName', 'prize'];
schema.statics.sanitizeUpdate = function sanitizeUpdate (updateObj) {
  return this.sanitize(updateObj, noUpdate);
};

// Returns true if user is the leader/owner of the challenge
schema.methods.isLeader = function isChallengeLeader (user) {
  return this.leader === user._id;
};

// Returns true if user is a member of the challenge
schema.methods.isMember = function isChallengeMember (user) {
  return user.challenges.indexOf(this._id) !== -1;
};

// Returns true if the user can modify (close, selectWinner, ...) the challenge
schema.methods.canModify = function canModifyChallenge (user) {
  return user.contributor.admin || this.isLeader(user);
};

// Returns true if user can join the challenge
schema.methods.canJoin = function canJoinChallenge (user, group) {
  if (group.type === 'guild' && group.privacy === 'public') return true;
  if (this.isLeader(user)) return true; // for when leader has left private group that contains the challenge
  return user.getGroups().indexOf(this.group) !== -1;
};

// Returns true if user can view the challenge
// Different from canJoin because you can see challenges of groups you've been removed from if you're participating in them
schema.methods.canView = function canViewChallenge (user, group) {
  if (this.isMember(user)) return true;
  return this.canJoin(user, group);
};

// Sync challenge to user, including tasks and tags.
// Used when user joins the challenge or to force sync.
schema.methods.syncToUser = async function syncChallengeToUser (user) {
  let challenge = this;
  challenge.shortName = challenge.shortName || challenge.name;

  // Add challenge to user.challenges
  if (!_.includes(user.challenges, challenge._id)) {
    // using concat because mongoose's protection against concurrent array modification isn't working as expected.
    // see https://github.com/HabitRPG/habitica/pull/7787#issuecomment-232972394
    user.challenges = user.challenges.concat([challenge._id]);
  }
  // Sync tags
  let userTags = user.tags;
  let i = _.findIndex(userTags, {id: challenge._id});

  if (i !== -1) {
    if (userTags[i].name !== challenge.shortName) {
      // update the name - it's been changed since
      // @TODO: We probably want to remove this. Owner is not allowed to change participant's copy of the tag.
      userTags[i].name = challenge.shortName;
    }
  } else {
    userTags.push({
      id: challenge._id,
      name: challenge.shortName,
      challenge: true,
    });
  }

  let [challengeTasks, userTasks] = await Promise.all([
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
      matchingTask = new Tasks[chalTask.type](Tasks.Task.sanitize(syncableAttrs(chalTask)));
      matchingTask.challenge = {taskId: chalTask._id, id: challenge._id, shortName: challenge.shortName};
      matchingTask.userId = user._id;
      user.tasksOrder[`${chalTask.type}s`].push(matchingTask._id);
      setNextDue(matchingTask, user);
    } else {
      _.merge(matchingTask, syncableAttrs(chalTask));
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
  return Promise.all(toSave);
};

async function _fetchMembersIds (challengeId) {
  return (await User.find({challenges: {$in: [challengeId]}}).select('_id').lean().exec()).map(member => member._id);
}

async function _addTaskFn (challenge, tasks, memberId) {
  let updateTasksOrderQ = {$push: {}};
  let toSave = [];

  tasks.forEach(chalTask => {
    let userTask = new Tasks[chalTask.type](Tasks.Task.sanitize(syncableAttrs(chalTask)));
    userTask.challenge = {taskId: chalTask._id, id: challenge._id, shortName: challenge.shortName};
    userTask.userId = memberId;

    // We want to sync the notes and tags when the task is first added to the challenge
    userTask.notes = chalTask.notes;
    userTask.tags.push(challenge._id);

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
  return await Promise.all(toSave);
}

// Add a new task to challenge members
schema.methods.addTasks = async function challengeAddTasks (tasks) {
  let challenge = this;
  let membersIds = await _fetchMembersIds(challenge._id);

  let queue = new TaskQueue(Promise, 25); // process only 5 users concurrently

  await Promise.all(membersIds.map(queue.wrap((memberId) => {
    return _addTaskFn(challenge, tasks, memberId);
  })));
};

// Sync updated task to challenge members
schema.methods.updateTask = async function challengeUpdateTask (task) {
  let challenge = this;

  let updateCmd = {$set: {}};

  let syncableTask = syncableAttrs(task);
  for (let key in syncableTask) {
    updateCmd.$set[key] = syncableTask[key];
  }

  let taskSchema = Tasks[task.type];
  // Updating instead of loading and saving for performances, risks becoming a problem if we introduce more complexity in tasks
  await taskSchema.update({
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
schema.methods.unlinkTasks = async function challengeUnlinkTasks (user, keep, saveUser = true) {
  let challengeId = this._id;
  let findQuery = {
    userId: user._id,
    'challenge.id': challengeId,
  };

  removeFromArray(user.challenges, challengeId);
  this.memberCount--;

  if (keep === 'keep-all') {
    await Tasks.Task.update(findQuery, {
      $set: {challenge: {}},
    }, {multi: true}).exec();

    const promises = [this.save()];

    // When multiple tasks are being unlinked at the same time,
    // save the user once outside of this function
    if (saveUser) promises.push(user.save());

    return Promise.all(promises);
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
    taskPromises.push(this.save());

    // When multiple tasks are being unlinked at the same time,
    // save the user once outside of this function
    if (saveUser) taskPromises.push(user.save());

    return Promise.all(taskPromises);
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

  // Refund the leader if the challenge is deleted (no winner chosen)
  if (brokenReason === 'CHALLENGE_DELETED') {
    await User.update({_id: challenge.leader}, {$inc: {balance: challenge.prize / 4}}).exec();
  }

  // Update the challengeCount on the group
  await Group.update({_id: challenge.group}, {$inc: {challengeCount: -1}}).exec();

  // Award prize to winner and notify
  if (winner) {
    winner.achievements.challenges.push(challenge.name);

    // If the winner cannot get gems (because of a group policy)
    // reimburse the leader
    const winnerCanGetGems = await winner.canGetGems();
    if (!winnerCanGetGems) {
      await User.update({_id: challenge.leader}, {$inc: {balance: challenge.prize / 4}}).exec();
    } else {
      winner.balance += challenge.prize / 4;
    }

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
      'tags.id': challenge._id,
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

  Promise.all(backgroundTasks);
};

export let model = mongoose.model('Challenge', schema);
