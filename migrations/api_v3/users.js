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

mongoose.Promise = Q.Promise; // otherwise mongoose models won't work

// Load old and new models
//import { model as NewUser } from '../../website/src/models/user';
//import * as Tasks from '../../website/src/models/task';

// To be defined later when MongoClient connects
var mongoDbOldInstance;
var oldUserCollection;

var mongoDbNewInstance;
var newUserCollection;
var newTaskCollection;

var BATCH_SIZE = 1000;

var processedUsers = 0;
var totoalProcessedTasks = 0;

// Only process users that fall in a interval ie -> 0000-4000-0000-0000
var AFTER_USER_ID = nconf.get('AFTER_USER_ID');
var BEFORE_USER_ID = nconf.get('BEFORE_USER_ID');

/* TODO
- _id 9
- challenges
- groups
- invitations
- challenges' tasks
*/

function processUsers (afterId) {
  var processedTasks = 0;
  var lastUser = null;
  var oldUsers;

  var query = {};

  if (BEFORE_USER_ID) {
    query._id = {$lte: BEFORE_USER_ID};
  }

  if (afterId) {
    query._id = {$gt: afterId};
  } else if (AFTER_USER_ID) {
    query._id = {$gt: AFTER_USER_ID};
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
      oldUser.habits = oldUser.dailys = oldUser.rewards = oldUser.todos = undefined;

      oldUser.challenges = [];
      if (oldUser.invitations) {
        oldUser.invitations.guilds = [];
        oldUser.invitations.party = {};
      }
      oldUser.party = {};
      oldUser.tags = oldUser.tags.map(function (tag) {
        return {
          _id: tag.id,
          name: tag.name,
          challenge: tag.challenge,
        };
      });

      oldUser.tasksOrder = {
        habits: [],
        dailys: [],
        rewards: [],
        todos: [],
      };

      //let newUser = new NewUser(oldUser);

      oldTasks.forEach(function (oldTask) {
        oldTask._id = uuid.v4(); // create a new unique uuid
        oldTask.userId = oldUser._id;
        oldTask.legacyId = oldTask.id; // store the old task id

        oldTask.challenge = {};
        if (!oldTask.text) oldTask.text = 'text';
        oldTask.tags = _.map(oldTask.tags, function (tagPresent, tagId) {
          return tagPresent && tagId;
        });

        if (oldTask.type !== 'todo' || (oldTask.type === 'todo' && !oldTask.completed)) {
          oldUser.tasksOrder[`${oldTask.type}s`].push(oldTask._id);
        }

        //let newTask = new Tasks[oldTask.type](oldTask);

        batchInsertTasks.insert(oldTask);
        processedTasks++;
      });

      batchInsertUsers.insert(oldUser);
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
... given a user

let processed = 0;
let batchSize = 1000;

var db; // defined later by MongoClient
var dbNewUsers;
var dbTasks;

var processUser = function(gt) {
  var query = {
    _id: {}
  };
  if(gt) query._id.$gt = gt;

  console.log('Launching query', query);

  // take batchsize docs from users and process them
  OldUserModel
    .find(query)
    .lean() // Use plain JS objects as old user data won't match the new model
    .limit(batchSize)
    .sort({_id: 1})
    .exec(function(err, users) {
      if(err) throw err;

      console.log('Processing ' + users.length + ' users.', 'Already processed: ' + processed);

      var lastUser = null;
      if(users.length === batchSize){
        lastUser = users[users.length - 1];
      }

      var tasksToSave = 0;

      // Initialize batch operation for later
      var batchInsertUsers = dbNewUsers.initializeUnorderedBulkOp();
      var batchInsertTasks = dbTasks.initializeUnorderedBulkOp();

      users.forEach(function(user){
        // user obj is a plain js object because we used .lean()

        // add tasks order arrays
        user.tasksOrder = {
          habits: [],
          rewards: [],
          todos: [],
          dailys: []
        };

        // ... convert tasks to individual models

        var tasksArr = user.dailys
                          .concat(user.habits)
                          .concat(user.todos)
                          .concat(user.rewards);

        // free memory?
        user.dailys = user.habits = user.todos = user.rewards = undefined;

        tasksArr.forEach(function(task){
          task.userId = user._id;

          task._id = shared.uuid(); // we rely on these to be unique... hopefully!
          task.legacyId = task.id;
          task.id = undefined;

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

          task = new TaskModel(task); // this should also fix dailies that wen to the habits array or vice-versa
          user.tasksOrder[task.type + 's'].push(task._id);
          tasksToSave++;
          batchInsertTasks.insert(task.toObject());
        });

        batchInsertUsers.insert((new NewUserModel(user)).toObject());
      });

      console.log('Saving', users.length, 'users and', tasksToSave, 'tasks');

      // Save in the background and dispatch another processUser();

      batchInsertUsers.execute(function(err, result){
        if(err) throw err // we can't simply accept errors
        console.log('Saved', result.nInserted, 'users')
      });

      batchInsertTasks.execute(function(err, result){
        if(err) throw err // we can't simply accept errors
        console.log('Saved', result.nInserted, 'tasks')
      });

      processed = processed + users.length;
      if(lastUser && lastUser._id){
        processUser(lastUser._id);
      } else {
        console.log('Done!');
      }
    });
};
*/

// Connect to the databases
var MongoClient = MongoDB.MongoClient;

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
