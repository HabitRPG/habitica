import mongoose from 'mongoose';
import validator from 'validator';
import _ from 'lodash';
import { TaskQueue } from 'cwait';
import baseModel from '../libs/baseModel';
import * as Tasks from './task';
import { model as User } from './user'; // eslint-disable-line import/no-cycle
import { // eslint-disable-line import/no-cycle
  model as Group,
  TAVERN_ID,
} from './group';
import { removeFromArray } from '../libs/collectionManipulators';
import shared from '../../common';
import { sendTxn as txnEmail } from '../libs/email'; // eslint-disable-line import/no-cycle
import { sendNotification as sendPushNotification } from '../libs/pushNotifications'; // eslint-disable-line import/no-cycle
import { syncableAttrs, setNextDue } from '../libs/tasks/utils';

const { Schema } = mongoose;

const { MIN_SHORTNAME_SIZE_FOR_CHALLENGES } = shared.constants;
const { MAX_SUMMARY_SIZE_FOR_CHALLENGES } = shared.constants;

const schema = new Schema({
  name: { $type: String, required: true },
  shortName: { $type: String, required: true, minlength: MIN_SHORTNAME_SIZE_FOR_CHALLENGES },
  summary: { $type: String, maxlength: MAX_SUMMARY_SIZE_FOR_CHALLENGES },
  description: String,
  official: { $type: Boolean, default: false },
  tasksOrder: {
    habits: [{ $type: String, ref: 'Task' }],
    dailys: [{ $type: String, ref: 'Task' }],
    todos: [{ $type: String, ref: 'Task' }],
    rewards: [{ $type: String, ref: 'Task' }],
  },
  leader: {
    $type: String, ref: 'User', validate: [v => validator.isUUID(v), 'Invalid uuid for challenge leader.'], required: true,
  },
  group: {
    $type: String, ref: 'Group', validate: [v => validator.isUUID(v), 'Invalid uuid for challenge group.'], required: true,
  },
  memberCount: { $type: Number, default: 0 },
  prize: {
    $type: Number, default: 0, min: 0, required: true,
  },
  categories: [{
    slug: { $type: String },
    name: { $type: String },
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

schema.pre('init', chal => {
  // The Vue website makes the summary be mandatory for all new challenges, but the
  // Angular website did not, and the API does not yet for backwards-compatibility.
  // When any challenge without a summary is fetched from the database, this code
  // supplies the name as the summary. This can be removed when all challenges have
  // a summary and the API makes it mandatory (a breaking change!)
  if (!chal.summary) {
    chal.summary = chal.name ? chal.name.substring(0, MAX_SUMMARY_SIZE_FOR_CHALLENGES) : ' ';
  }
});

// A list of additional fields that cannot be updated (but can be set on creation)
const noUpdate = ['group', 'leader', 'official', 'prize'];
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
  return user.hasPermission('challengeAdmin') || this.isLeader(user);
};

// Returns true if user can join the challenge
schema.methods.canJoin = function canJoinChallenge (user, group) {
  // for when leader has left private group that contains the challenge
  if (this.isLeader(user)) return true;
  if (group.type === 'guild' && group.privacy === 'public') {
    return group._id === TAVERN_ID;
  }
  if (group.type === 'guild' && group.privacy === 'private') {
    if (!group.hasActiveGroupPlan()) return false;
  }
  return user.getGroups().indexOf(this.group) !== -1;
};

// Returns true if the challenge was successfully added to the user
// or false if the user already in the challenge
schema.methods.addToUser = async function addChallengeToUser (user) {
  // Add challenge to users challenges atomically (with a condition that checks that it
  // is not there already) to prevent multiple concurrent requests from passing through
  // see https://github.com/HabitRPG/habitica/issues/11295
  const result = await User.updateOne(
    {
      _id: user._id,
      challenges: { $nin: [this._id] },
    },
    { $push: { challenges: this._id } },
  ).exec();

  return !!result.nModified;
};

// Returns true if user can view the challenge
// Different from canJoin because you can see challenges of groups
// you've been removed from if you're participating in them
schema.methods.canView = function canViewChallenge (user, group) {
  if (this.isMember(user)) return true;
  return this.canJoin(user, group);
};

// Sync challenge tasks to user, including tags.
// Used when user joins the challenge or to force sync.
schema.methods.syncTasksToUser = async function syncChallengeTasksToUser (user) {
  const challenge = this;
  challenge.shortName = challenge.shortName || challenge.name;

  // Sync tags
  const userTags = user.tags;
  const i = _.findIndex(userTags, { id: challenge._id });

  if (i !== -1) {
    if (userTags[i].name !== challenge.shortName) {
      // update the name - it's been changed since
      // @TODO: We probably want to remove this.
      // Owner is not allowed to change participant's copy of the tag.
      userTags[i].name = challenge.shortName;
    }
  } else {
    userTags.push({
      id: challenge._id,
      name: challenge.shortName,
      challenge: true,
    });
  }

  const [challengeTasks, userTasks] = await Promise.all([
    // Find original challenge tasks
    Tasks.Task.find({
      userId: { $exists: false },
      'challenge.id': challenge._id,
    }).exec(),
    // Find user's tasks linked to this challenge
    Tasks.Task.find({
      userId: user._id,
      'challenge.id': challenge._id,
    }).exec(),
  ]);

  const toSave = []; // An array of things to save

  challengeTasks.forEach(chalTask => {
    let matchingTask = _.find(userTasks, userTask => userTask.challenge.taskId === chalTask._id);

    if (!matchingTask) { // If the task is new, create it
      matchingTask = new Tasks[chalTask.type](Tasks.Task.sanitize(syncableAttrs(chalTask)));
      matchingTask.challenge = {
        taskId: chalTask._id,
        id: challenge._id,
        shortName: challenge.shortName,
      };
      matchingTask.userId = user._id;
      user.tasksOrder[`${chalTask.type}s`].push(matchingTask._id);
      setNextDue(matchingTask, user);
    } else {
      _.merge(matchingTask, syncableAttrs(chalTask));
      // Make sure the task is in user.tasksOrder
      const orderList = user.tasksOrder[`${chalTask.type}s`];
      if (orderList.indexOf(matchingTask._id) === -1 && (matchingTask.type !== 'todo' || !matchingTask.completed)) orderList.push(matchingTask._id);
    }

    // don't override the notes, but provide it if not provided
    if (!matchingTask.notes) matchingTask.notes = chalTask.notes;
    // add tag if missing
    if (matchingTask.tags.indexOf(challenge._id) === -1) matchingTask.tags.push(challenge._id);
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
  return (await User.find({ challenges: { $in: [challengeId] } }).select('_id').lean().exec()).map(member => member._id);
}

async function _addTaskFn (challenge, tasks, memberId) {
  const updateTasksOrderQ = { $push: {} };
  const toSave = [];

  tasks.forEach(chalTask => {
    const userTask = new Tasks[chalTask.type](Tasks.Task.sanitize(syncableAttrs(chalTask)));
    userTask.challenge = {
      taskId: chalTask._id,
      id: challenge._id,
      shortName: challenge.shortName,
    };
    userTask.userId = memberId;

    // We want to sync the notes and tags when the task is first added to the challenge
    userTask.notes = chalTask.notes;
    userTask.tags.push(challenge._id);

    const tasksOrderList = updateTasksOrderQ.$push[`tasksOrder.${chalTask.type}s`];
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

  // Update the tag list of the user document of a participating member of the challenge
  // such that a tag representing the challenge into which the task to be added will
  // be added to the user tag list if and only if the tag does not exist already.
  const addToChallengeTagSet = {
    $addToSet: {
      tags: {
        id: challenge._id,
        name: challenge.shortName,
        challenge: true,
      },
    },
  };
  const updateUserParams = { ...updateTasksOrderQ, ...addToChallengeTagSet };
  toSave.unshift(User.updateOne({ _id: memberId }, updateUserParams).exec());

  return Promise.all(toSave);
}

// Add a new task to challenge members
schema.methods.addTasks = async function challengeAddTasks (tasks) {
  const challenge = this;
  const membersIds = await _fetchMembersIds(challenge._id);

  const queue = new TaskQueue(Promise, 25); // process only this many users concurrently

  await Promise.all(membersIds.map(queue.wrap(memberId => _addTaskFn(challenge, tasks, memberId))));
};

// Sync updated task to challenge members
schema.methods.updateTask = async function challengeUpdateTask (task) {
  const challenge = this;

  const updateCmd = { $set: {} };

  const syncableTask = syncableAttrs(task);
  for (const key of Object.keys(syncableTask)) {
    updateCmd.$set[key] = syncableTask[key];
  }

  const taskSchema = Tasks[task.type];
  // Updating instead of loading and saving for performances,
  // risks becoming a problem if we introduce more complexity in tasks
  await taskSchema.updateMany({
    userId: { $exists: true },
    'challenge.id': challenge.id,
    'challenge.taskId': task._id,
  }, updateCmd).exec();
};

// Remove a task from challenge members
schema.methods.removeTask = async function challengeRemoveTask (task) {
  const challenge = this;

  // Set the task as broken
  await Tasks.Task.updateMany({
    userId: { $exists: true },
    'challenge.id': challenge.id,
    'challenge.taskId': task._id,
  }, {
    $set: { 'challenge.broken': 'TASK_DELETED' },
  }).exec();
};

// Unlink challenges tasks (and the challenge itself) from user. TODO rename to 'leave'
schema.methods.unlinkTasks = async function challengeUnlinkTasks (user, keep, saveUser = true) {
  const challengeId = this._id;
  const findQuery = {
    userId: user._id,
    'challenge.id': challengeId,
  };

  removeFromArray(user.challenges, challengeId);
  this.memberCount -= 1;

  if (keep === 'keep-all') {
    await Tasks.Task.updateMany(findQuery, {
      $set: { challenge: {} },
    }).exec();

    const promises = [this.save()];

    // When multiple tasks are being unlinked at the same time,
    // save the user once outside of this function
    if (saveUser) promises.push(user.save());

    return Promise.all(promises);
  } // keep = 'remove-all'
  const tasks = await Tasks.Task.find(findQuery).select('_id type completed').exec();
  const taskPromises = tasks.map(task => {
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
};

// TODO everything here should be moved to a worker
// actually even for a worker it's probably just too big
// and will kill mongo, figure out something else
schema.methods.closeChal = async function closeChal (broken = {}) {
  const challenge = this;

  const { winner } = broken;
  const brokenReason = broken.broken;

  // Delete the challenge
  await this.model('Challenge').remove({ _id: challenge._id }).exec();

  // Refund the leader if the challenge is deleted (no winner chosen)
  if (brokenReason === 'CHALLENGE_DELETED') {
    await User.updateOne({ _id: challenge.leader }, { $inc: { balance: challenge.prize / 4 } })
      .exec();
  }

  // Update the challengeCount on the group
  await Group.updateOne({ _id: challenge.group }, { $inc: { challengeCount: -1 } }).exec();

  // Award prize to winner and notify
  if (winner) {
    winner.achievements.challenges.push(challenge.name);

    // If the winner cannot get gems (because of a group policy)
    // reimburse the leader
    const winnerCanGetGems = await winner.canGetGems();
    if (!winnerCanGetGems) {
      await User.updateOne(
        { _id: challenge.leader },
        { $inc: { balance: challenge.prize / 4 } },
      ).exec();
    } else {
      winner.balance += challenge.prize / 4;
    }

    winner.addNotification('WON_CHALLENGE', {
      id: challenge._id,
      name: challenge.name,
      prize: challenge.prize,
      leader: challenge.leader,
    });

    const savedWinner = await winner.save();

    if (savedWinner.preferences.emailNotifications.wonChallenge !== false) {
      txnEmail(savedWinner, 'won-challenge', [
        { name: 'CHALLENGE_NAME', content: challenge.name },
      ]);
    }
    if (savedWinner.preferences.pushNotifications.wonChallenge !== false) {
      sendPushNotification(savedWinner,
        {
          title: challenge.name,
          message: shared.i18n.t('wonChallenge', savedWinner.preferences.language),
          identifier: 'wonChallenge',
        });
    }
  }

  // Run some operations in the background without blocking the thread
  const backgroundTasks = [
    // And it's tasks
    Tasks.Task.remove({ 'challenge.id': challenge._id, userId: { $exists: false } }).exec(),
    // Set the challenge tag to non-challenge status
    // and remove the challenge from the user's challenges
    User.updateMany({
      challenges: challenge._id,
      'tags.id': challenge._id,
    }, {
      $set: { 'tags.$.challenge': false },
      $pull: { challenges: challenge._id },
    }).exec(),
    // Break users' tasks
    Tasks.Task.updateMany({
      'challenge.id': challenge._id,
    }, {
      $set: {
        'challenge.broken': brokenReason,
        'challenge.winner': winner && winner.profile.name,
      },
    }).exec(),
  ];

  Promise.all(backgroundTasks);
};

export const model = mongoose.model('Challenge', schema); // eslint-disable-line import/prefer-default-export
