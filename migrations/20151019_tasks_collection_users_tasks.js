// Migrate users' tasks to individual models
// This should run AFTER 20151019_tasks_collection_challenges_tasks.js

// Enable coffee-script
require('coffee-script');

// Load config
var nconf = require('nconf');
var utils = require('../website/src/utils');
utils.setupConfig();

// Load async
var async = require('async');

// Initialize mongoose
var mongoose = require('mongoose');

var mongooseOptions = {
  replset: { socketOptions: { keepAlive: 1, connectTimeoutMS: 30000 } },
  server: { socketOptions: { keepAlive: 1, connectTimeoutMS: 30000 } }
};
var db = mongoose.connect(nconf.get('NODE_DB_URI'), mongooseOptions, function(err) {
  if (err) throw err;
  console.log('Connected with Mongoose');
});

//...

var shared = require('../common/script');
var _ = require('lodash');

// Load models 
// oldUser will map to original users collection, 
// newUser to the new collection
var OldUserModel = require('../website/src/models/userOld').model; // The originals user model
var NewUserModel = require('../website/src/models/user').model // The new user model
var TaskModel = require('../website/src/models/task').model;

var challengeTasksChangedId = {};
// ... given a user

var processed = 0;
var batchSize = 1000;

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

var MongoClient = require('mongodb').MongoClient;

MongoClient.connect(nconf.get('NODE_DB_URI'), function(err, dbInstance) {
  if(err) throw err;

  db = dbInstance;
  dbNewUsers = db.collection('newusers');
  dbTasks = db.collection('tasks');

  processUser("77777777-7777-7777-7777-777777777777");
});
