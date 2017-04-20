// Migrate challenges members
// Run AFTER users migration

// The console-stamp module must be installed (not included in package.json)

// It requires two environment variables: MONGODB_OLD and MONGODB_NEW

// Due to some big user profiles it needs more RAM than is allowed by default by v8 (arounf 1.7GB).
// Run the script with --max-old-space-size=4096 to allow up to 4GB of RAM
console.log('Starting migrations/api_v3/challengesMembers.js.');

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

// To be defined later when MongoClient connects
var mongoDbOldInstance;
var oldChallengeCollection;

var mongoDbNewInstance;
var newUserCollection;

var BATCH_SIZE = 1000;

var processedChallenges = 0;

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

  console.log(`Executing challenges query.\nMatching challenges after ${afterId ? afterId : AFTER_CHALLENGE_ID} and before ${BEFORE_CHALLENGE_ID} (included).`);

  return oldChallengeCollection
  .find(query)
  .sort({_id: 1})
  .limit(BATCH_SIZE)
  .toArray()
  .then(function (oldChallengesR) {
    oldChallenges = oldChallengesR;

    var promises = [];

    console.log(`Processing ${oldChallenges.length} challenges. Already processed ${processedChallenges} challenges.`);

    if (oldChallenges.length === BATCH_SIZE) {
      lastChallenge = oldChallenges[oldChallenges.length - 1]._id;
    }

    oldChallenges.forEach(function (oldChallenge) {
      // Tyler Renelle
      oldChallenge.members.forEach(function (id, index) {
        if (id === '9') {
          oldChallenge.members[index] = '00000000-0000-4000-9000-000000000000';
        }
      });

      promises.push(newUserCollection.updateMany({
        _id: {$in: oldChallenge.members || []},
      }, {
        $push: {challenges: oldChallenge._id},
      }, {multi: true}));
    });

    console.log(`Migrating members of ${oldChallenges.length} challenges.`);

    return Bluebird.all(promises);
  })
  .then(function () {
    processedChallenges += oldChallenges.length;

    console.log(`Migrated members of ${oldChallenges.length} challenges.`);

    if (lastChallenge) {
      return processChallenges(lastChallenge);
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
  oldChallengeCollection = mongoDbOldInstance.collection('challenges');

  mongoDbNewInstance = newInstance;
  newUserCollection = mongoDbNewInstance.collection('users');

  console.log(`Connected with MongoClient to ${MONGODB_OLD} and ${MONGODB_NEW}.`);

  return processChallenges();
})
.catch(function (err) {
  console.error(err.stack || err);
});
