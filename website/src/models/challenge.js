var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var shared = require('../../../common');
var async = require('async');
var _ = require('lodash');
var Task = require('./task').model;

var ChallengeSchema = new Schema({
  _id: {type: String, 'default': shared.uuid},
  name: String,
  shortName: String,
  description: String,
  official: {type: Boolean,'default':false},
  leader: {type: String, ref: 'User'},
  group: {type: String, ref: 'Group'},
  timestamp: {type: Date, 'default': Date.now},
  members: [{type: String, ref: 'User'}],
  memberCount: {type: Number, 'default': 0},
  prize: {type: Number, 'default': 0},
  // List of habits/dailys/todos/rewards IDs to keep track of order
  tasksOrder: {
    habits: [{type: String, ref: 'Task'}],
    rewards: [{type: String, ref: 'Task'}],
    todos: [{type: String, ref: 'Task'}],
    dailys: [{type: String, ref: 'Task'}]
  }
});

// Get all the tasks belonging to a challenge,
// with their history
// TODO filter just one or more types of tasks
ChallengeSchema.methods.getTasks = function(cb) {
  Task.find({
    // TODO $or for userId: null?
    userId: {$exists: false},
    'challenge.id': this._id
  }, function(err, tasks){
    if(err) return cb(err);

    cb(null, tasks);
  });
};

ChallengeSchema.methods.toJSON = function(){
  var doc = this.toObject();
  doc._isMember = this._isMember;
  return doc;
};

// Given a challenge and an array of tasks, return an API compatible challenge + tasks obj
ChallengeSchema.methods.addTasksToChallenge = function(tasks) {
  var obj = this.toJSON();
  var tasksOrder = obj.tasksOrder; // Saving a reference because we won't return it

  obj.habits = [];
  obj.dailys = [];
  obj.todos = [];
  obj.rewards = [];

  obj.tasksOrder = undefined;
  var unordered = [];

  tasks.forEach(function(task){
    // We want to push the task at the same position where it's stored in tasksOrder
    var pos = tasksOrder[task.type + 's'].indexOf(task._id);
    if(pos === -1) { // Should never happen, it means the lists got out of sync
      unordered.push(task.toJSON());
    } else {
      obj[task.type + 's'][pos] = task.toJSON();
    }
    
  });

  // Reconcile unordered items
  unordered.forEach(function(task){
    obj[task.type + 's'].push(task);
  });

  return obj;
};

// Return the data maintaining backward compatibility
ChallengeSchema.methods.getTransformedData = function(cb) {
  var self = this;
  this.getTasks(function(err, tasks) {
    if(err) return cb(err);
    cb(null, self.addTasksToChallenge(tasks));
  });
};

// --------------
// Syncing logic
// --------------

function syncableAttrs(task) {
  var t = (task.toObject) ? task.toObject() : task; // lodash doesn't seem to like _.omit on EmbeddedDocument
  // only sync/compare important attrs
  var omitAttrs = '_id challenge history tags completed streak notes'.split(' ');
  if (t.type != 'reward') omitAttrs.push('value');
  return _.omit(t, omitAttrs);
}

/**
 * Compare whether any changes have been made to tasks. If so, we'll want to sync those changes to subscribers
 */
function comparableData(obj) {
  if(obj && obj[0] && obj[0].toJSON){
    obj = obj.map(function(doc) {
      return doc.toJSON();
    });
  }

  return JSON.stringify(
    _(obj)
      .sortBy('id') // we don't want to update if they're sort-order is different
      .transform(function(result, task){
        result.push(syncableAttrs(task));
      })
      .value())
}

ChallengeSchema.methods.isOutdated = function(oldData, newData) {
  return comparableData(oldData) !== comparableData(newData);
}

/**
 * Syncs all new tasks, deleted tasks, etc to the user object
 * @param user
 * @return nothing, user is modified directly. REMEMBER to save the user!
 */
ChallengeSchema.methods.syncToUser = function(user, tasks, cb) {
  if (!user) return;
  if(Array.isArray(tasks)) tasks = _.object(_.pluck(tasks, '_id'), tasks);
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

  user.getTasks(function(err, userTasks) {
    if(err) return cb(err);
    var tasksToSave = [];

    // Map of userTasks belonging to this challenge with keyy task.challenge.taskId
    var userTasksObj = {};
    userTasks.forEach(function(task){
      if(task.challenge && task.challenge.id === self._id){
        userTasksObj[task.challenge.taskId] = task;
      }
    });

    // Sync new tasks and updated tasks
    _.each(tasks, function(task, taskId){
      var userTask;

      if(!userTasksObj[taskId]){
        userTask = new Task(syncableAttrs(task));
        userTask.userId = user._id;
        user.tasksOrder[userTask.type + 's'].push(userTask._id);
      } else {
        userTask = userTasksObj[taskId];
      }

      userTask.challenge = {id: self._id, taskId: taskId};
      if (!userTask.notes) userTask.notes = task.notes;
      userTask.tags = task.tags || {};
      userTask.tags[self._id] = true;
      _.merge(userTask, syncableAttrs(task));

      tasksToSave.push(userTask);
    });

    // Flag deleted tasks as "broken"
    _.each(userTasksObj, function(task){
      if (task.challenge && task.challenge.id==self._id && !tasks[task.challenge.taskId]) {
        task.challenge.broken = 'TASK_DELETED';
        tasksToSave.push(task);
      }
    });

    // save user too
    tasksToSave.push(user)
    async.each(tasksToSave, function(toSave, cb1) {
      toSave.save(cb1);
    }, cb);
  });
};


module.exports.schema = ChallengeSchema;
module.exports.model = mongoose.model("Challenge", ChallengeSchema);
