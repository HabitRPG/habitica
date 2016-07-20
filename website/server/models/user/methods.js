import shared from '../../../../common';
import _ from 'lodash';
import * as Tasks from '../task';
import Bluebird from 'bluebird';
import {
  chatDefaults,
  TAVERN_ID,
} from '../group';
import { defaults } from 'lodash';

import schema from './schema';

schema.methods.isSubscribed = function isSubscribed () {
  return !!this.purchased.plan.customerId; // eslint-disable-line no-implicit-coercion
};

// Get an array of groups ids the user is member of
schema.methods.getGroups = function getUserGroups () {
  let userGroups = this.guilds.slice(0); // clone user.guilds so we don't modify the original
  if (this.party._id) userGroups.push(this.party._id);
  userGroups.push(TAVERN_ID);
  return userGroups;
};

schema.methods.sendMessage = async function sendMessage (userToReceiveMessage, message) {
  let sender = this;

  shared.refPush(userToReceiveMessage.inbox.messages, chatDefaults(message, sender));
  userToReceiveMessage.inbox.newMessages++;
  userToReceiveMessage._v++;
  userToReceiveMessage.markModified('inbox.messages');

  shared.refPush(sender.inbox.messages, defaults({sent: true}, chatDefaults(message, userToReceiveMessage)));
  sender.markModified('inbox.messages');

  let promises = [userToReceiveMessage.save(), sender.save()];
  await Bluebird.all(promises);
};

schema.methods.addNotification = function addUserNotification (type, data = {}) {
  this.notifications.push({
    type,
    data,
  });
};

// Methods to adapt the new schema to API v2 responses (mostly tasks inside the user model)
// These will be removed once API v2 is discontinued

// Get all the tasks belonging to a user,
schema.methods.getTasks = function getUserTasks () {
  let args = Array.from(arguments);
  let cb;
  let type;

  if (args.length === 1) {
    cb = args[0];
  } else {
    type = args[0];
    cb = args[1];
  }

  let query = {
    userId: this._id,
  };

  if (type) query.type = type;

  Tasks.Task.find(query, cb);
};

// Given user and an array of tasks, return an API compatible user + tasks obj
schema.methods.addTasksToUser = function addTasksToUser (tasks) {
  let obj = this.toJSON();

  obj.id = obj._id;
  obj.filters = {};

  obj.tags = obj.tags.map(tag => {
    return {
      id: tag.id,
      name: tag.name,
      challenge: tag.challenge,
    };
  });

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
schema.methods.getTransformedData = function getTransformedData (cb) {
  let self = this;
  this.getTasks((err, tasks) => {
    if (err) return cb(err);
    cb(null, self.addTasksToUser(tasks));
  });
};

// END of API v2 methods