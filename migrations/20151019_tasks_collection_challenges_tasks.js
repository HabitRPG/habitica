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
var mongoose = require('mongoose');

// NOTE this migration requires the mongodb module, not defined in package.json
// you can run npm install mongodb
var mongooseOptions = {
  replset: { socketOptions: { keepAlive: 1, connectTimeoutMS: 30000 } },
  server: { socketOptions: { keepAlive: 1, connectTimeoutMS: 30000 } }
};
var db = mongoose.connect(nconf.get('NODE_DB_URI'), mongooseOptions, function(err) {
  if (err) throw err;
  console.log('Connected with Mongoose');
});

// Load shared (for uuid)
var shared = require('../common/script');

// Load models 
// oldChallenge will map to original challenges collection, 
// newChallenge to the new collection
var OldChallengeModel = require('../website/src/models/challengeOld').model; // The original challenge model
var NewChallengeModel = require('../website/src/models/challenge').model // The new challenge model
var TaskModel = require('../website/src/models/task').model;

// ... given a challenge

var processed = 0;
var batchSize = 10000;

// A map of original taskId -> [new taskId in challenge, challendId] d of tasks belonging to challenges where their task id had to change
// So later we can have them use the right task.challenge.taskId
var duplicateTasks = {};

var processChal = function(gt) {
  var query = {};
  if(gt) query._id = {$gt: gt};

  console.log(query);

  OldChallengeModel
    .find(query)
    .lean() // Use plain JS objects as old challenge data won't match the new model
    .limit(batchSize)
    .sort({_id: 1})
    .exec(function(err, challenges) {
      if(err) throw err;

      var lastChal = null;
      if(challenges.length === batchSize){
        lastChal = challenges[challenges.length - 1];
      }

      console.log('Processing ' + challenges.length + ' challenges.', 'Already processed: ' + processed);

      async.eachSeries(challenges, function(challenge, cb) {
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
            task.id = undefined;

            task.challenge = task.challenge || {};
            task.challenge.id = challenge._id;

            task = new TaskModel(task); // this should also fix dailies that wen to the habits array or vice-versa

            TaskModel.findOne({_id: task._id}, function(err, taskSameId){
              if(err) return cb1(err);

              // We already have a task with the same id, change this one
              // and will require special handling
              if(taskSameId) {
                task._id = shared.uuid();
                task.legacyId = taskSameId._id; // We set this for challenge tasks too 
                // we use an array as the same task may have multiple duplicates
                duplicateTasks[taskSameId._id] = duplicateTasks[taskSameId._id] || [];
                duplicateTasks[taskSameId._id].push([task._id, challenge._id]);
                console.log('Duplicate task ', taskSameId._id, 'challenge ', challenge._id, 'new id ', task._id);
              }

              task.save(function(err, savedTask){
                if(err) return cb1(err);

                challenge.tasksOrder[savedTask.type + 's'].push(savedTask._id);
                cb1();
              });
            });
          }, function(err) {
            if(err) return cb(err);

            var newChallenge = new NewChallengeModel(challenge); // This will make sure old data is discarded
            newChallenge.save(function(err, chal){
              if(err) return cb(err);
              console.log('Processed: ', chal._id);
              cb();
            });
          });
      }, function(err) {
        if(err) throw err;

        processed = processed + challenges.length;
        console.log('Processed ' + challenges.length + ' challenges.', 'Total: ' + processed);

        if(lastChal && lastChal._id){
          processChal(lastChal._id);
        } else {
          console.log('Done!');
          // outputting the duplicate tasks
          console.log(JSON.stringify(duplicateTasks, null, 4));
        }
      });
    });
};

processChal();
