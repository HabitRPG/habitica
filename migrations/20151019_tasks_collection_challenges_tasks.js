// Migrate challenges' tasks to individual models

// Enable coffee-script
require('coffee-script');

// Load config
var nconf = require('nconf');
var utils = require('../website/src/utils');
utils.setupConfig();

// Load async
var async = require('async');

// Initialize mongoose
require('mongoose');

var mongooseOptions = {};
var db = mongoose.connect(nconf.get('NODE_DB_URI'), mongooseOptions, function(err) {
  if (err) throw err;
  logging.info('Connected with Mongoose');
});

// Load shared (for uuid)
var shared = require('../common/script');

// Load models 
// oldChallenge will map to original challenge collection, 
// newChallenge to the new collection
var OldChallengeModel = require('../website/src/models/challengeOld').model; // The originals challenge model
var NewChallengeModel = require('../website/src/models/challenge').model // The new challenge model
var TaskModel = require('../website/src/models/task').model;

// ... given a challenge

var processed = 0;
var batchSize = 50;

OldChallengeModel
  .find()
  .limit(100) // try with 100 to start
  .lean() // Use plain JS objects as old challenge data won't match the new model
  .batchSize(batchSize)
  .exec(function(err, challenges) {
    if(err) throw err;

    console.log('Processing ' + batchSize + ' challenges.', 'Already processed: ' + processed);

    async.each(challenges, function(challenge, cb) {
      // add tasks order arrays
      challenge.tasksOrder = {
        habits: [],
        rewards: [],
        todos: [],
        dailys: []
      };

      // ... convert tasks to individual models
      async.each(
        challenge.dailys
          .concat(challenge.habits)
          .concat(challenge.rewards)
          .concat(challenge.todos),
        function(task, cb1) {
          task._id = task.id;
          delete task.id;

          task.challenge = task.challenge || {};
          task.challenge.id = challenge._id;

          task = new TaskModel(task); // this should also fix dailies that wen to the habits array or vice-versa

          TaskModel.findOne({_id: task._id}, function(err, taskSameId){
            if(err) return cb1(err);

            // We already have a task with the same id, change this one
            // MAKE SURE IT NEVER HAPPENS WITH CHALLENGES AS IT WILL BREAK USERS' TASKS THEN
            // and will require special handling
            if(taskSameId) {
              return cb1(new Error('Duplicate challenge task id.'));
              task._id = shared.uuid();
            }

            task.save(function(err, savedTask){
              if(err) return cb1(err);

              challenge.tasksOrder[savedTask.type + 's'].push(savedTask._id);

              var newChallenge = new NewChallengeModel(challenge);
              newChallenge.save(cb1);
            });
          });
        }, cb);
    }, function(err) {
      if(err) throw err;

      processed = processed + batchSize;
      console.log('Processed ' + batchSize + ' challenges.', 'Total: ' + processed);
    });
  });