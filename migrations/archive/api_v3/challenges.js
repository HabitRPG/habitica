// Migrate challenges collection to new schema (except for members)

// The console-stamp module must be installed (not included in package.json)

// It requires two environment variables: MONGODB_OLD and MONGODB_NEW

// Due to some big user profiles it needs more RAM than is allowed by default by v8 (arounf 1.7GB).
// Run the script with --max-old-space-size=4096 to allow up to 4GB of RAM

// IMPORTANT NOTE: this migration was written when we were using version 3 of lodash.
// We've now upgraded to lodash v4 but the code used in this migration has not been
// adapted to work with it. Before this migration is used again any lodash method should
// be checked for compatibility against the v4 changelog and changed if necessary.
// https://github.com/lodash/lodash/wiki/Changelog#v400
console.log('Starting migrations/api_v3/challenges.js.');

require('babel-register');
require('babel-polyfill');

let Bluebird = require('bluebird');
let MongoDB = require('mongodb');
let nconf = require('nconf');
let mongoose = require('mongoose');
let _ = require('lodash');
let uuid = require('uuid');
let consoleStamp = require('console-stamp');
let fs = require('fs');

// Add timestamps to console messages
consoleStamp(console);

// Initialize configuration
require('../../website/server/libs/api-v3/setupNconf')();

let MONGODB_OLD = nconf.get('MONGODB_OLD');
let MONGODB_NEW = nconf.get('MONGODB_NEW');

let MongoClient = MongoDB.MongoClient;

mongoose.Promise = Bluebird; // otherwise mongoose models won't work

// Load new models
let NewChallenge = require('../../website/server/models/challenge').model;
let Tasks = require('../../website/server/models/task');

// To be defined later when MongoClient connects
let mongoDbOldInstance;
let oldChallengeCollection;

let mongoDbNewInstance;
let newChallengeCollection;
let newTaskCollection;

let BATCH_SIZE = 1000;

let processedChallenges = 0;
let totoalProcessedTasks = 0;

let newTasksIds = {}; // a map of old id -> [new id, challengeId]

// Only process challenges that fall in a interval ie -> up to 0000-4000-0000-0000
let AFTER_CHALLENGE_ID = nconf.get('AFTER_CHALLENGE_ID');
let BEFORE_CHALLENGE_ID = nconf.get('BEFORE_CHALLENGE_ID');

function processChallenges (afterId) {
  let processedTasks = 0;
  let lastChallenge = null;
  let oldChallenges;

  let query = {};

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

  let batchInsertTasks = newTaskCollection.initializeUnorderedBulkOp();
  let batchInsertChallenges = newChallengeCollection.initializeUnorderedBulkOp();

  console.log(`Executing challenges query.\nMatching challenges after ${afterId ? afterId : AFTER_CHALLENGE_ID} and before ${BEFORE_CHALLENGE_ID} (included).`);

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
        let oldTasks = oldChallenge.habits.concat(oldChallenge.dailys).concat(oldChallenge.rewards).concat(oldChallenge.todos);
        delete oldChallenge.habits;
        delete oldChallenge.dailys;
        delete oldChallenge.rewards;
        delete oldChallenge.todos;

        let createdAt = oldChallenge.timestamp;

        oldChallenge.memberCount = oldChallenge.members.length;
        if (oldChallenge.prize <= 0) oldChallenge.prize = 0;
        if (!oldChallenge.name) oldChallenge.name = 'challenge name';
        if (!oldChallenge.shortName) oldChallenge.name = 'challenge-name';

        if (!oldChallenge.group) throw new Error('challenge.group is required');
        if (!oldChallenge.leader) throw new Error('challenge.leader is required');


        if (oldChallenge.leader === '9') {
          oldChallenge.leader = '00000000-0000-4000-9000-000000000000';
        }

        if (oldChallenge.group === 'habitrpg') {
          oldChallenge.group = '00000000-0000-4000-A000-000000000000';
        }

        delete oldChallenge.id;

        let newChallenge = new NewChallenge(oldChallenge);

        newChallenge.createdAt = createdAt;

        oldTasks.forEach(function (oldTask) {
          oldTask._id = uuid.v4();
          oldTask._legacyId = oldTask.id; // store the old task id
          delete oldTask.id;

          oldTask.challenge = oldTask.challenge || {};
          oldTask.challenge.id = newChallenge._id;

          if (newTasksIds[`${oldTask._legacyId  }-${  newChallenge._id}`]) {
            throw new Error('duplicate :(');
          } else {
            newTasksIds[`${oldTask._legacyId  }-${  newChallenge._id}`] = oldTask._id;
          }

          oldTask.tags = _.map(oldTask.tags || {}, function (tagPresent, tagId) {
            return tagPresent && tagId;
          }).filter(function (tag) {
            return tag !== false;
          });

          if (!oldTask.text) oldTask.text = 'task text'; // required

          oldTask.createdAt = oldTask.dateCreated;

          newChallenge.tasksOrder[`${oldTask.type}s`].push(oldTask._id);
          if (oldTask.completed) oldTask.completed = false;

          let newTask = new Tasks[oldTask.type](oldTask);

          batchInsertTasks.insert(newTask.toObject());
          processedTasks++;
        });

        batchInsertChallenges.insert(newChallenge.toObject());
      });

      console.log(`Saving ${oldChallenges.length} challenges and ${processedTasks} tasks.`);

      return Bluebird.all([
        batchInsertChallenges.execute(),
        batchInsertTasks.execute(),
      ]);
    })
    .then(function () {
      totoalProcessedTasks += processedTasks;
      processedChallenges += oldChallenges.length;

      console.log(`Saved ${oldChallenges.length} challenges and their tasks.`);

      if (lastChallenge) {
        return processChallenges(lastChallenge);
      } else {
        console.log('Writing newTasksIds.json...');
        fs.writeFileSync('newTasksIds.json', JSON.stringify(newTasksIds, null, 4), 'utf8');
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
    let oldInstance = result[0];
    let newInstance = result[1];

    mongoDbOldInstance = oldInstance;
    oldChallengeCollection = mongoDbOldInstance.collection('challenges');

    mongoDbNewInstance = newInstance;
    newChallengeCollection = mongoDbNewInstance.collection('challenges');
    newTaskCollection = mongoDbNewInstance.collection('tasks');

    console.log(`Connected with MongoClient to ${MONGODB_OLD} and ${MONGODB_NEW}.`);

    return processChallenges();
  })
  .catch(function (err) {
    console.error(err.stack || err);
  });
