// OLD (v2) CHALLENGE MODEL

var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var shared = require('../../../common');
var _ = require('lodash');
var TaskSchemas = require('./task');

var ChallengeSchema = new Schema({
  _id: {type: String, 'default': shared.uuid},
  name: String,
  shortName: String,
  description: String,
  official: {type: Boolean,'default':false},
  habits:   [TaskSchemas.HabitSchema],
  dailys:   [TaskSchemas.DailySchema],
  todos:    [TaskSchemas.TodoSchema],
  rewards:  [TaskSchemas.RewardSchema],
  leader: {type: String, ref: 'User'},
  group: {type: String, ref: 'Group'},
  timestamp: {type: Date, 'default': Date.now},
  members: [{type: String, ref: 'User'}],
  memberCount: {type: Number, 'default': 0},
  prize: {type: Number, 'default': 0}
}, {collection: 'challenges'});

ChallengeSchema.virtual('tasks').get(function () {
  var tasks = this.habits.concat(this.dailys).concat(this.todos).concat(this.rewards);
  var tasks = _.object(_.pluck(tasks,'id'), tasks);
  return tasks;
});

ChallengeSchema.methods.toJSON = function(){
  var doc = this.toObject();
  doc._isMember = this._isMember;
  return doc;
}

// --------------
// Syncing logic
// --------------

function syncableAttrs(task) {
  var t = (task.toObject) ? task.toObject() : task; // lodash doesn't seem to like _.omit on EmbeddedDocument
  // only sync/compare important attrs
  var omitAttrs = 'challenge history tags completed streak notes'.split(' ');
  if (t.type != 'reward') omitAttrs.push('value');
  return _.omit(t, omitAttrs);
}

/**
 * Compare whether any changes have been made to tasks. If so, we'll want to sync those changes to subscribers
 */
function comparableData(obj) {
  return JSON.stringify(
    _(obj.habits.concat(obj.dailys).concat(obj.todos).concat(obj.rewards))
      .sortBy('id') // we don't want to update if they're sort-order is different
      .transform(function(result, task){
        result.push(syncableAttrs(task));
      })
      .value())
}

ChallengeSchema.methods.isOutdated = function(newData) {
  return comparableData(this) !== comparableData(newData);
}

/**
 * Syncs all new tasks, deleted tasks, etc to the user object
 * @param user
 * @return nothing, user is modified directly. REMEMBER to save the user!
 */
ChallengeSchema.methods.syncToUser = function(user, cb) {
  if (!user) return;
  var self = this;
  self.shortName = self.shortName || self.name;

  // Add challenge to user.challenges
  if (!_.contains(user.challenges, self._id)) {
      user.challenges.push(self._id);
  }

  // Sync tags
  var tags = user.tags || [];
  var i = _.findIndex(tags, {id: self._id})
  if (~i) {
    if (tags[i].name !== self.shortName) {
      // update the name - it's been changed since
      user.tags[i].name = self.shortName;
    }
  } else {
    user.tags.push({
      id: self._id,
      name: self.shortName,
      challenge: true
    });
  }

  // Sync new tasks and updated tasks
  _.each(self.tasks, function(task){
    var list = user[task.type+'s'];
    var userTask = user.tasks[task.id] || (list.push(syncableAttrs(task)), list[list.length-1]);
    if (!userTask.notes) userTask.notes = task.notes; // don't override the notes, but provide it if not provided
    userTask.challenge = {id:self._id};
    userTask.tags = userTask.tags || {};
    userTask.tags[self._id] = true;
    _.merge(userTask, syncableAttrs(task));
  })

  // Flag deleted tasks as "broken"
  _.each(user.tasks, function(task){
    if (task.challenge && task.challenge.id==self._id && !self.tasks[task.id]) {
      task.challenge.broken = 'TASK_DELETED';
    }
  })

  user.save(cb);
};


module.exports.schema = ChallengeSchema;
module.exports.model = mongoose.model("ChallengeOld", ChallengeSchema);
