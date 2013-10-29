var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var helpers = require('habitrpg-shared/script/helpers');
var _ = require('lodash');
var TaskSchema = require('./task').schema;

var ChallengeSchema = new Schema({
  _id: {type: String, 'default': helpers.uuid},
  name: String,
  description: String,
  habits: [TaskSchema],
  dailys: [TaskSchema],
  todos: [TaskSchema],
  rewards: [TaskSchema],
  leader: {type: String, ref: 'User'},
  group: {type: String, ref: 'Group'},
    // FIXME remove below, we don't need it since every time we load a challenge, we'll load it with the group ref. we don't need to look up challenges by type
    //type: group.type, //type: {type: String,"enum": ['guild', 'party']},
    //id: group._id
  //},
  timestamp: {type: Date, 'default': Date.now},
  members: [{type: String, ref: 'User'}]
}, {
  minimize: 'false'
});

ChallengeSchema.virtual('tasks').get(function () {
  var tasks = this.habits.concat(this.dailys).concat(this.todos).concat(this.rewards);
  var tasks = _.object(_.pluck(tasks,'id'), tasks);
  return tasks;
});

module.exports.schema = ChallengeSchema;
module.exports.model = mongoose.model("Challenge", ChallengeSchema);