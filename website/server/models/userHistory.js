import mongoose from 'mongoose';
import validator from 'validator';
import baseModel from '../libs/baseModel';

const { Schema } = mongoose;

export const schema = new Schema({
  userId: {
    $type: String,
    ref: 'User',
    required: true,
    validate: [v => validator.isUUID(v), 'Invalid uuid for userhistory.'],
    index: true,
    unique: true,
  },
  armoire: [
    {
      _id: false,
      timestamp: { $type: Date, required: true },
      reward: { $type: String, required: true },
    },
  ],
  questInviteResponses: [
    {
      _id: false,
      timestamp: { $type: Date, required: true },
      quest: { $type: String, required: true },
      response: { $type: String, required: true },
    },
  ],
  cron: [
    {
      _id: false,
      timestamp: { $type: Date, required: true },
    },
  ],
}, {
  strict: true,
  minimize: false, // So empty objects are returned
  typeKey: '$type', // So that we can use fields named `type`
});

schema.plugin(baseModel, {
  noSet: ['id', '_id', 'userId'],
  timestamps: true,
  _id: false, // using custom _id
});

export const model = mongoose.model('UserHistory', schema);

const commitUserHistoryUpdate = function commitUserHistoryUpdate (update) {
  const data = {
    $push: {

    },
  };
  if (update.data.armoire.length) {
    data.$push.armoire = {
      $each: update.data.armoire,
      $sort: { timestamp: -1 },
      $slice: 10,
    };
  }
  if (update.data.questInviteResponses.length) {
    data.$push.questInviteResponses = {
      $each: update.data.questInviteResponses,
      $sort: { timestamp: -1 },
      $slice: 10,
    };
  }
  if (update.data.cron.length > 0) {
    data.$push.cron = {
      $each: update.data.cron,
      $sort: { timestamp: -1 },
      $slice: 10,
    };
  }
  return model.updateOne(
    { userId: update.userId },
    data,
  ).exec();
};

model.beginUserHistoryUpdate = function beginUserHistoryUpdate (userID) {
  return {
    userId: userID,
    data: {
      armoire: [],
      questInviteResponses: [],
      cron: [],
    },
    withArmoire: function withArmoire (reward) {
      this.data.armoire.push({
        timestamp: new Date(),
        reward,
      });
      return this;
    },
    withQuestInviteResponse: function withQuestInviteResponse (quest, response) {
      this.data.questInviteResponses.push({
        timestamp: new Date(),
        quest,
        response,
      });
      return this;
    },
    withCron: function withCron () {
      this.data.cron.push({
        timestamp: new Date(),
      });
      return this;
    },
    commit: function commit () {
      commitUserHistoryUpdate(this);
    },
  };
};
