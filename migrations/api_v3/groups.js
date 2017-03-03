/*
  members are not stored anymore
  invites are not stored anymore

  tavern id and leader must be updated
*/

// Migrate groups collection to new schema
// Run AFTER users migration

// The console-stamp module must be installed (not included in package.json)

// It requires two environment variables: MONGODB_OLD and MONGODB_NEW

// Due to some big user profiles it needs more RAM than is allowed by default by v8 (arounf 1.7GB).
// Run the script with --max-old-space-size=4096 to allow up to 4GB of RAM
console.log('Starting migrations/api_v3/groups.js.');

// IMPORTANT NOTE: this migration was written when we were using version 3 of lodash.
// We've now upgraded to lodash v4 but the code used in this migration has not been
// adapted to work with it. Before this migration is used again any lodash method should
// be checked for compatibility against the v4 changelog and changed if necessary.
// https://github.com/lodash/lodash/wiki/Changelog#v400

require('babel-register');
require('babel-polyfill');

var Bluebird = require('bluebird');
var MongoDB = require('mongodb');
var nconf = require('nconf');
var mongoose = require('mongoose');
var _ = require('lodash');
var uuid = require('uuid');
var consoleStamp = require('console-stamp');

// Add timestamps to console messages
consoleStamp(console);

// Initialize configuration
require('../../website/server/libs/api-v3/setupNconf')();

var MONGODB_OLD = nconf.get('MONGODB_OLD');
var MONGODB_NEW = nconf.get('MONGODB_NEW');

var MongoClient = MongoDB.MongoClient;

mongoose.Promise = Bluebird; // otherwise mongoose models won't work

// Load new models
var NewGroup = require('../../website/server/models/group').model;

var TAVERN_ID = require('../../website/server/models/group').TAVERN_ID;

// To be defined later when MongoClient connects
var mongoDbOldInstance;
var oldGroupCollection;

var mongoDbNewInstance;
var newGroupCollection;
var newUserCollection;

var BATCH_SIZE = 1000;

var processedGroups = 0;

// Only process groups that fall in a interval ie -> up to 0000-4000-0000-0000
var AFTER_GROUP_ID = nconf.get('AFTER_GROUP_ID');
var BEFORE_GROUP_ID = nconf.get('BEFORE_GROUP_ID');

function processGroups (afterId) {
  var processedTasks = 0;
  var lastGroup = null;
  var oldGroups;

  var query = {};

  if (BEFORE_GROUP_ID) {
    query._id = {$lte: BEFORE_GROUP_ID};
  }

  if ((afterId || AFTER_GROUP_ID) && !query._id) {
    query._id = {};
  }

  if (afterId) {
    query._id.$gt = afterId;
  } else if (AFTER_GROUP_ID) {
    query._id.$gt = AFTER_GROUP_ID;
  }

  var batchInsertGroups = newGroupCollection.initializeUnorderedBulkOp();

  console.log(`Executing groups query.\nMatching groups after ${afterId ? afterId : AFTER_GROUP_ID} and before ${BEFORE_GROUP_ID} (included).`);

  return oldGroupCollection
  .find(query)
  .sort({_id: 1})
  .limit(BATCH_SIZE)
  .toArray()
  .then(function (oldGroupsR) {
    oldGroups = oldGroupsR;

    var promises = [];

    console.log(`Processing ${oldGroups.length} groups. Already processed ${processedGroups} groups.`);

    if (oldGroups.length === BATCH_SIZE) {
      lastGroup = oldGroups[oldGroups.length - 1]._id;
    }

    oldGroups.forEach(function (oldGroup) {
      if ((!oldGroup.privacy || oldGroup.privacy === 'private') && (!oldGroup.members || oldGroup.members.length === 0)) return; // delete empty private groups TODO must also delete challenges or this won't work

      oldGroup.members = oldGroup.members || [];
      oldGroup.memberCount = oldGroup.members ? oldGroup.members.length : 0;
      oldGroup.challengeCount = oldGroup.challenges ? oldGroup.challenges.length : 0;

      if (oldGroup.balance <= 0) oldGroup.balance = 0;
      if (!oldGroup.name) oldGroup.name = 'group name';
      if (!oldGroup.leaderOnly) oldGroup.leaderOnly = {};
      if (!oldGroup.leaderOnly.challenges) oldGroup.leaderOnly.challenges = false;

      // Tavern
      if (oldGroup._id === 'habitrpg') {
        oldGroup._id = TAVERN_ID;
        oldGroup.leader = '7bde7864-ebc5-4ee2-a4b7-1070d464cdb0'; // Siena Leslie
      }

      if (!oldGroup.type) {
        // throw new Error('group.type is required');
        oldGroup.type = 'guild';
      }

      if (!oldGroup.leader) {
        if (oldGroup.members && oldGroup.members.length > 0) {
          oldGroup.leader = oldGroup.members[0];
        } else {
          throw new Error('group.leader is required and no member available!');
        }
      }

      if (!oldGroup.privacy) {
        // throw new Error('group.privacy is required');
        oldGroup.privacy = 'private';
      }

      var updateMembers = {};

      if (oldGroup.type === 'guild') {
        updateMembers.$push = {guilds: oldGroup._id};
      } else if (oldGroup.type === 'party') {
        updateMembers.$set = {'party._id': oldGroup._id};
      }

      if (oldGroup.members) {
        // Tyler Renelle
        oldGroup.members.forEach(function (id, index) {
          if (id === '9') {
            oldGroup.members[index] = '00000000-0000-4000-9000-000000000000';
          }
        });

        promises.push(newUserCollection.updateMany({
          _id: {$in: oldGroup.members},
        }, updateMembers, {multi: true}));
      }

      var newGroup = new NewGroup(oldGroup);

      batchInsertGroups.insert(newGroup.toObject());
    });

    console.log(`Saving ${oldGroups.length} groups and migrating members to users collection.`);

    promises.push(batchInsertGroups.execute());
    return Bluebird.all(promises);
  })
  .then(function () {
    processedGroups += oldGroups.length;

    console.log(`Saved ${oldGroups.length} groups and migrated their members to the user collection.`);

    if (lastGroup) {
      return processGroups(lastGroup);
    } else {
      return console.log('Done!');
    }
  });
}

// Connect to the databases
Bluebird.all([
  MongoClient.connect(MONGODB_OLD),
  MongoClient.connect(MONGODB_NEW),
])
.then(function (result) {
  var oldInstance = result[0];
  var newInstance = result[1];

  mongoDbOldInstance = oldInstance;
  oldGroupCollection = mongoDbOldInstance.collection('groups');

  mongoDbNewInstance = newInstance;
  newGroupCollection = mongoDbNewInstance.collection('groups');
  newUserCollection = mongoDbNewInstance.collection('users');

  console.log(`Connected with MongoClient to ${MONGODB_OLD} and ${MONGODB_NEW}.`);

  // First delete the tavern group created by having required the group model
  return newGroupCollection.deleteOne({_id: TAVERN_ID});
})
.then(function () {
  return processGroups();
})
.catch(function (err) {
  console.error(err.stack || err);
});
