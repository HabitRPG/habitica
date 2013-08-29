var GroupSchema, Schema, helpers, mongoose, _;

mongoose = require("mongoose");

Schema = mongoose.Schema;

helpers = require('habitrpg-shared/script/helpers');

_ = require('lodash');

GroupSchema = new Schema({
  _id: {
    type: String,
    'default': helpers.uuid
  },
  name: String,
  description: String,
  leader: {
    type: String,
    ref: 'User'
  },
  members: [
    {
      type: String,
      ref: 'User'
    }
  ],
  invites: [
    {
      type: String,
      ref: 'User'
    }
  ],
  type: {
    type: String,
    "enum": ['guild', 'party']
  },
  privacy: {
    type: String,
    "enum": ['private', 'public']
  },
  _v: {
    Number: Number,
    'default': 0
  },
  chat: Array,
  /*
  #    [{
  #      timestamp: Date
  #      user: String
  #      text: String
  #      contributor: String
  #      uuid: String
  #      id: String
  #    }]
  */

  balance: Number,
  logo: String,
  leaderMessage: String
}, {
  strict: 'throw'
});

module.exports.schema = GroupSchema;

module.exports.model = mongoose.model("Group", GroupSchema);