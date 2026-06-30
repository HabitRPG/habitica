import nconf from 'nconf';
import mongoose from 'mongoose';
import validator from 'validator';
import baseModel from '../libs/baseModel';

const { Schema } = mongoose;

const userHistoryLength = nconf.get('USER_HISTORY_LENGTH') || 20;

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
      client: { $type: String, required: false },
      reward: { $type: String, required: true },
    },
  ],
  questInviteResponses: [
    {
      _id: false,
      timestamp: { $type: Date, required: true },
      client: { $type: String, required: false },
      quest: { $type: String, required: true },
      response: { $type: String, required: true },
    },
  ],
  cron: [
    {
      _id: false,
      timestamp: { $type: Date, required: true },
      checkinCount: { $type: Number, required: true },
      client: { $type: String, required: false },
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
      $slice: userHistoryLength,
    };
  }
  if (update.data.questInviteResponses.length) {
    data.$push.questInviteResponses = {
      $each: update.data.questInviteResponses,
      $sort: { timestamp: -1 },
      $slice: userHistoryLength,
    };
  }
  if (update.data.cron.length > 0) {
    data.$push.cron = {
      $each: update.data.cron,
      $sort: { timestamp: -1 },
      $slice: userHistoryLength,
    };
  }
  return model.updateOne(
    { userId: update.userId },
    data,
  ).exec();
};

model.beginUserHistoryUpdate = function beginUserHistoryUpdate (userID, headers = null) {
  return {
    userId: userID,
    data: {
      headers: headers || {},
      armoire: [],
      questInviteResponses: [],
      cron: [],
    },
    withArmoire: function withArmoire (reward) {
      this.data.armoire.push({
        timestamp: new Date(),
        client: this.data.headers['x-client'],
        reward,
      });
      return this;
    },
    withQuestInviteResponse: function withQuestInviteResponse (quest, response) {
      this.data.questInviteResponses.push({
        timestamp: new Date(),
        client: this.data.headers['x-client'],
        quest,
        response,
      });
      return this;
    },
    withCron: function withCron (checkinCount) {
      this.data.cron.push({
        timestamp: new Date(),
        checkinCount,
        client: this.data.headers['x-client'],
      });
      return this;
    },
    commit: function commit () {
      commitUserHistoryUpdate(this);
    },
  };
};
