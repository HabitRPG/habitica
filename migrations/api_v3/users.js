// Migrate users collection to new schema
// This should run AFTER challenges migration

// The console-stamp module must be installed (not included in package.json)

// It requires two environment variables: MONGODB_OLD and MONGODB_NEW

// Due to some big user profiles it needs more RAM than is allowed by default by v8 (arounf 1.7GB).
// Run the script with --max-old-space-size=4096 to allow up to 4GB of RAM
console.log('Starting migrations/api_v3/users.js.');

require('babel-register');

var Q = require('q');
var MongoDB = require('mongodb');
var nconf = require('nconf');
var mongoose = require('mongoose');
var _ = require('lodash');
var uuid = require('uuid');
var consoleStamp = require('console-stamp');

// Add timestamps to console messages
consoleStamp(console);

// Initialize configuration
require('../../website/src/libs/api-v3/setupNconf')();

var MONGODB_OLD = nconf.get('MONGODB_OLD');
var MONGODB_NEW = nconf.get('MONGODB_NEW');

var MongoClient = MongoDB.MongoClient;

mongoose.Promise = Q.Promise; // otherwise mongoose models won't work

// Load new models
var NewUser = require('../../website/src/models/user').model;
var NewTasks = require('../../website/src/models/task');

// To be defined later when MongoClient connects
var mongoDbOldInstance;
var oldUserCollection;

var mongoDbNewInstance;
var newUserCollection;
var newTaskCollection;

var BATCH_SIZE = 1000;

var processedUsers = 0;
var totoalProcessedTasks = 0;

// Only process users that fall in a interval ie up to -> 0000-4000-0000-0000
var AFTER_USER_ID = nconf.get('AFTER_USER_ID');
var BEFORE_USER_ID = nconf.get('BEFORE_USER_ID');

/* TODO compare old and new model
- _id 9
- challenges
- groups
- invitations
- challenges' tasks
- checklists from .id to ._id (reminders too!)
*/

function processUsers (afterId) {
  var processedTasks = 0;
  var lastUser = null;
  var oldUsers;

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

      oldUser.tags = oldUser.tags.map(function (tag) {
        return {
          _id: tag.id,
          name: tag.name,
          challenge: tag.challenge,
        };
      });

      var newUser = new NewUser(oldUser);

      oldTasks.forEach(function (oldTask) {
        oldTask._id = uuid.v4(); // create a new unique uuid
        oldTask.userId = newUser._id;
        oldTask.legacyId = oldTask.id; // store the old task id
        delete oldTask.id;

        oldTask.challenge = {};
        if (!oldTask.text) oldTask.text = 'task text'; // required
        oldTask.tags = _.map(oldTask.tags, function (tagPresent, tagId) {
          return tagPresent && tagId;
        });

        if (oldTask.type !== 'todo' || (oldTask.type === 'todo' && !oldTask.completed)) {
          newUser.tasksOrder[`${oldTask.type}s`].push(oldTask._id);
        }

        var newTask = new NewTasks[oldTask.type](oldTask);

        batchInsertTasks.insert(newTask.toObject());
        processedTasks++;
      });

      batchInsertUsers.insert(newUser.toObject());
    });

    console.log(`Saving ${oldUsers.length} users and ${processedTasks} tasks.`);

    return Q.all([
      batchInsertUsers.execute(),
      batchInsertTasks.execute(),
    ]);
  })
  .then(function () {
    totoalProcessedTasks += processedTasks;
    processedUsers += oldUsers.length;

    console.log(`Saved ${oldUsers.length} users and their tasks.`);

    if (lastUser) {
      return processUsers(lastUser);
    } else {
      return console.log('Done!');
    }
  });
}

/*

TODO var challengeTasksChangedId = {};

tasksArr.forEach(function(task){
  task.challenge = task.challenge || {};
  if(task.challenge.id) {
    // If challengeTasksChangedId[task._id] then we got on of the duplicates from the challenges migration
    if (challengeTasksChangedId[task.legacyId]) {
      var res = _.find(challengeTasksChangedId[task.legacyId], function(arr){
        return arr[1] === task.challenge.id;
      });

      // If res, id changed, otherwise matches the original one
      task.challenge.taskId = res ? res[0] : task.legacyId;
    } else {
      task.challenge.taskId = task.legacyId;
    }
  }

  if(!task.type) console.log('Task without type ', task._id, ' user ', user._id);
});
*/

// Connect to the databases
Q.all([
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
  console.error(err);
});
