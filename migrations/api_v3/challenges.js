/*
  name is required,
  shortName is required,
  tasksOrder
  habits, dailys, todos and rewards must be removed
  leader is required
  group is required
  members must be removed
  memberCount must be checked
  prize must be >= 0
*/

// A map of (original taskId) -> [new taskId in challenge, challendId] of tasks belonging to challenges where the task id had to change
// This way later we can have use the right task.challenge.taskId in user's tasks
var duplicateTasks = {};

        // ... convert tasks to individual models
        async.each(
          challenge.dailys
            .concat(challenge.habits)
            .concat(challenge.rewards)
            .concat(challenge.todos),
          function(task, cb1) {

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
var NewChallenge = require('../../website/src/models/challenge').model;
var Tasks = require('../../website/src/models/task');

// To be defined later when MongoClient connects
var mongoDbOldInstance;
var oldChallengeCollection;

var mongoDbNewInstance;
var newChallengeCollection;
var newTaskCollection;

var BATCH_SIZE = 1000;

var processedChallenges = 0;
var totoalProcessedTasks = 0;

// Only process challenges that fall in a interval ie -> up to 0000-4000-0000-0000
var AFTER_CHALLENGE_ID = nconf.get('AFTER_CHALLENGE_ID');
var BEFORE_CHALLENGE_ID = nconf.get('BEFORE_CHALLENGE_ID');

function processChallenges (afterId) {
  var processedTasks = 0;
  var lastChallenge = null;
  var oldChallenges;

  var query = {};

  if (BEFORE_CHALLENGE_ID) {
    query._id = {$lte: BEFORE_CHALLENGE_ID};
  }

  if ((afterId || AFTER_CHALLENGE_ID) && !query._id) {
    query._id = {};
  }

  if (afterId) {
    query._id.$gt = afterId;
  } else if (AFTER_CHALLENGE_ID) {
    query._id.$gt = AFTER_CHALLENGE_ID;
  }

  var batchInsertTasks = newTaskCollection.initializeUnorderedBulkOp();
  var batchInsertChallenges = newChallengeCollection.initializeUnorderedBulkOp();

  console.log(`Executing challenges query.\nMatching challenges after ${afterId ? afterId : AFTER_USER_ID} and before ${BEFORE_USER_ID} (included).`);

  return oldChallengeCollection
  .find(query)
  .sort({_id: 1})
  .limit(BATCH_SIZE)
  .toArray()
  .then(function (oldChallengesR) {
    oldChallenges = oldChallengesR;

    console.log(`Processing ${oldChallenges.length} challenges. Already processed ${processedChallenges} challenges and ${totoalProcessedTasks} tasks.`);

    if (oldChallenges.length === BATCH_SIZE) {
      lastChallenge = oldChallenges[oldChallenges.length - 1]._id;
    }

    oldChallenges.forEach(function (oldChallenge) {
      var oldTasks = oldChallenge.habits.concat(oldChallenge.dailys).concat(oldChallenge.rewards).concat(oldChallenge.todos);
      delete oldChallenge.habits;
      delete oldChallenge.dailys;
      delete oldChallenge.rewards;
      delete oldChallenge.todos;

      var newChallenge = new NewChallenge(oldChallenge);

      oldTasks.forEach(function (oldTask) {
        // TODO
        oldTask._id = oldTask.id; // keep the old uuid unless duplicated
        delete oldTask.id;

        oldTask.challenge = oldTask.challenge || {};
        oldTask.challenge.id = oldChallenge.id;

        if (!oldTask.text) oldTask.text = 'task text'; // required
        oldTask.tags = _.map(oldTask.tags, function (tagPresent, tagId) { // TODO used for challenges' tasks?
          return tagPresent && tagId;
        });

        newChallenge.tasksOrder[`${oldTask.type}s`].push(oldTask._id);
        if (oldTask.completed) oldTask.completed = false;

        var newTask = new Tasks[oldTask.type](oldTask);

        batchInsertTasks.insert(newTask.toObject());
        processedTasks++;
      });

      batchInsertChallenges.insert(newChallenge.toObject());
    });

    console.log(`Saving ${oldChallenges.length} users and ${processedTasks} tasks.`);

    return Q.all([
      batchInsertChallenges.execute(),
      batchInsertTasks.execute(),
    ]);
  })
  .then(function () {
    totoalProcessedTasks += processedTasks;
    processedChallenges += oldChallenges.length;

    console.log(`Saved ${oldChallenges.length} users and their tasks.`);

    if (lastUser) {
      return processChallenges(lastChallenge);
    } else {
      return console.log('Done!');
    }
  });
}

// Connect to the databases
Q.all([
  MongoClient.connect(MONGODB_OLD),
  MongoClient.connect(MONGODB_NEW),
])
.then(function (result) {
  var oldInstance = result[0];
  var newInstance = result[1];

  mongoDbOldInstance = oldInstance;
  oldChallengeCollection = mongoDbOldInstance.collection('challenges');

  mongoDbNewInstance = newInstance;
  newChallengeCollection = mongoDbNewInstance.collection('challenges');
  newTaskCollection = mongoDbNewInstance.collection('tasks');

  console.log(`Connected with MongoClient to ${MONGODB_OLD} and ${MONGODB_NEW}.`);

  return processChallenges();
})
.catch(function (err) {
  console.error(err);
});
