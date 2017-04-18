// Migrate users collection to new schema
// This should run AFTER challenges migration

// The console-stamp module must be installed (not included in package.json)

// It requires two environment variables: MONGODB_OLD and MONGODB_NEW

// Due to some big user profiles it needs more RAM than is allowed by default by v8 (arounf 1.7GB).
// Run the script with --max-old-space-size=4096 to allow up to 4GB of RAM
console.log('Starting migrations/api_v3/users.js.');

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
var common = require('../../common');
var moment = require('moment');

// Add timestamps to console messages
consoleStamp(console);

// Initialize configuration
require('../../website/server/libs/api-v3/setupNconf')();

var MONGODB_OLD = nconf.get('MONGODB_OLD');
var MONGODB_NEW = nconf.get('MONGODB_NEW');

var taskDefaults = common.taskDefaults;
var MongoClient = MongoDB.MongoClient;

mongoose.Promise = Bluebird; // otherwise mongoose models won't work

// Load new models
var NewUser = require('../../website/server/models/user').model;
var NewTasks = require('../../website/server/models/task');

// To be defined later when MongoClient connects
var mongoDbOldInstance;
var oldUserCollection;

var mongoDbNewInstance;
var newUserCollection;
var newTaskCollection;

var BATCH_SIZE = 1000;

var processedUsers = 0;
var totoalProcessedTasks = 0;

var challengeTaskWithMatchingId = 0;
var challengeTaskNoMatchingId = 0;

// Load the new tasks ids for challenges tasks
var newTasksIds = require('./newTasksIds.json');

// Only process users that fall in a interval ie up to -> 0000-4000-0000-0000
var AFTER_USER_ID = nconf.get('AFTER_USER_ID');
var BEFORE_USER_ID = nconf.get('BEFORE_USER_ID');

function processUsers (afterId) {
  var processedTasks = 0;
  var lastUser = null;
  var oldUsers;

  var now = new Date();

  var query = {};

  if (BEFORE_USER_ID) {
    query._id = {$lte: BEFORE_USER_ID};
  }

  if ((afterId || AFTER_USER_ID) && !query._id) {
    query._id = {};
  }

  if (afterId) {
    query._id.$gt = afterId;
  } else if (AFTER_USER_ID) {
    query._id.$gt = AFTER_USER_ID;
  }

  var batchInsertTasks = newTaskCollection.initializeUnorderedBulkOp();
  var batchInsertUsers = newUserCollection.initializeUnorderedBulkOp();

  console.log(`Executing users query.\nMatching users after ${afterId ? afterId : AFTER_USER_ID} and before ${BEFORE_USER_ID} (included).`);

  return oldUserCollection
  .find(query)
  .sort({_id: 1})
  .limit(BATCH_SIZE)
  .toArray()
  .then(function (oldUsersR) {
    oldUsers = oldUsersR;

    console.log(`Processing ${oldUsers.length} users. Already processed ${processedUsers} users and ${totoalProcessedTasks} tasks.`);

    if (oldUsers.length === BATCH_SIZE) {
      lastUser = oldUsers[oldUsers.length - 1]._id;
    }

    oldUsers.forEach(function (oldUser) {
      var oldTasks = oldUser.habits.concat(oldUser.dailys).concat(oldUser.rewards).concat(oldUser.todos);
      delete oldUser.habits;
      delete oldUser.dailys;
      delete oldUser.rewards;
      delete oldUser.todos;

      delete oldUser.id;

      // spookDust -> spookySparkles

      if (oldUser.achievements && oldUser.achievements.spookDust) {
        oldUser.achievements.spookySparkles = oldUser.achievements.spookDust;
        delete oldUser.achievements.spookDust;
      }

      if (oldUser.items && oldUser.items.special && oldUser.items.special.spookDust) {
        oldUser.items.special.spookySparkles = oldUser.items.special.spookDust;
        delete oldUser.items.special.spookDust;
      }

      if (oldUser.stats && oldUser.stats.buffs && oldUser.stats.buffs.spookySparkles) {
        oldUser.stats.buffs.spookySparkles = oldUser.stats.buffs.spookDust;
        delete oldUser.stats.buffs.spookDust;
      }

      // end spookDust -> spookySparkles

      oldUser.tags = oldUser.tags.map(function (tag) {
        return {
          id: tag.id,
          name: tag.name || 'tag name',
          challenge: tag.challenge,
        };
      });

      if (oldUser._id === '9') { // Tyler Renelle
        oldUser._id = '00000000-0000-4000-9000-000000000000';
      }

      var newUser = new NewUser(oldUser);
      var isSubscribed = newUser.isSubscribed();

      oldTasks.forEach(function (oldTask) {
        oldTask._id = uuid.v4(); // create a new unique uuid
        oldTask.userId = newUser._id;
        oldTask._legacyId = oldTask.id; // store the old task id
        delete oldTask.id;

        oldTask.challenge = oldTask.challenge || {};
        if (oldTask.challenge.id) {
          if (oldTask.challenge.broken) {
            oldTask.challenge.taskId = oldTask._legacyId;
          } else {
            var newId = newTasksIds[oldTask._legacyId + '-' + oldTask.challenge.id];

            // Challenges' tasks ids changed
            if (!newId && !oldTask.challenge.broken) {
              challengeTaskNoMatchingId++;
              oldTask.challenge.taskId = oldTask._legacyId;
              oldTask.challenge.broken = 'CHALLENGE_TASK_NOT_FOUND';
            } else {
              challengeTaskWithMatchingId++;
              oldTask.challenge.taskId = newId;
            }
          }
        }

        // Delete old completed todos
        if (oldTask.type === 'todo' && oldTask.completed && (!oldTask.challenge.id || oldTask.challenge.broken)) {
          if (moment(now).subtract(isSubscribed ? 90 : 30, 'days').toDate() > moment(oldTask.dateCompleted).toDate()) {
            return;
          }
        }

        oldTask.createdAt = oldTask.dateCreated;

        if (!oldTask.text) oldTask.text = 'task text'; // required
        oldTask.tags = _.map(oldTask.tags, function (tagPresent, tagId) {
          return tagPresent && tagId;
        }).filter(function (tag) {
          return tag !== false;
        });

        if (oldTask.type !== 'todo' || (oldTask.type === 'todo' && !oldTask.completed)) {
          newUser.tasksOrder[`${oldTask.type}s`].push(oldTask._id);
        }

        var allTasksFields = ['_id', 'type', 'text', 'notes', 'tags', 'value', 'priority', 'attribute', 'challenge', 'reminders', 'userId', '_legacyId', 'createdAt'];
        // using mongoose models is too slow
        if (oldTask.type === 'habit') {
          oldTask = _.pick(oldTask, allTasksFields.concat(['history', 'up', 'down']));
        } else if (oldTask.type === 'daily') {
          oldTask = _.pick(oldTask, allTasksFields.concat(['completed', 'collapseChecklist', 'checklist', 'history', 'frequency', 'everyX', 'startDate', 'repeat', 'streak']));
        } else if (oldTask.type === 'todo') {
          oldTask = _.pick(oldTask, allTasksFields.concat(['completed', 'collapseChecklist', 'checklist', 'date', 'dateCompleted']));
        } else if (oldTask.type === 'reward') {
          oldTask = _.pick(oldTask, allTasksFields);
        } else {
          throw new Error('Task with no or invalid type!');
        }

        batchInsertTasks.insert(taskDefaults(oldTask));
        processedTasks++;
      });

      batchInsertUsers.insert(newUser.toObject());
    });

    console.log(`Saving ${oldUsers.length} users and ${processedTasks} tasks.`);

    return Bluebird.all([
      batchInsertUsers.execute(),
      batchInsertTasks.execute(),
    ]);
  })
  .then(function () {
    totoalProcessedTasks += processedTasks;
    processedUsers += oldUsers.length;

    console.log(`Saved ${oldUsers.length} users and their tasks.`);
    console.log('Challenges\' tasks no matching id: ', challengeTaskNoMatchingId);
    console.log('Challenges\' tasks with matching id: ', challengeTaskWithMatchingId);

    if (lastUser) {
      return processUsers(lastUser);
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
  oldUserCollection = mongoDbOldInstance.collection('users');

  mongoDbNewInstance = newInstance;
  newUserCollection = mongoDbNewInstance.collection('users');
  newTaskCollection = mongoDbNewInstance.collection('tasks');

  console.log(`Connected with MongoClient to ${MONGODB_OLD} and ${MONGODB_NEW}.`);

  return processUsers();
})
.catch(function (err) {
  console.error(err.stack || err);
});
