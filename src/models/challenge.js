var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var helpers = require('habitrpg-shared/script/helpers');
var _ = require('lodash');
var TaskSchema = require('./task').schema;
var Group = require('./group').model;

var ChallengeSchema = new Schema({
  _id: {type: String, 'default': helpers.uuid},
  name: String,
  shortName: String,
  description: String,
  habits: [TaskSchema],
  dailys: [TaskSchema],
  todos: [TaskSchema],
  rewards: [TaskSchema],
  leader: {type: String, ref: 'User'},
  group: {type: String, ref: 'Group'},
  timestamp: {type: Date, 'default': Date.now},
  members: [{type: String, ref: 'User'}],
  memberCount: {type: Number, 'default': 0},
  prize: {type: Number, 'default': 0}
});

ChallengeSchema.virtual('tasks').get(function () {
  var tasks = this.habits.concat(this.dailys).concat(this.todos).concat(this.rewards);
  var tasks = _.object(_.pluck(tasks,'id'), tasks);
  return tasks;
});

// FIXME this isn't always triggered, since we sometimes use update() or findByIdAndUpdate()
// @see https://github.com/LearnBoost/mongoose/issues/964
ChallengeSchema.pre('save', function(next){
  this.memberCount = _.size(this.members);
  next()
})

ChallengeSchema.methods.toJSON = function(){
  var doc = this.toObject();
  doc.memberCount = doc.members ? _.size(doc.members) : doc.memberCount; // @see pre('save') comment above
  doc._isMember = this._isMember;
  return doc;
}

module.exports.schema = ChallengeSchema;
module.exports.model = mongoose.model("Challenge", ChallengeSchema);