// Migrate unsubscriptions collection to new schema

// The console-stamp module must be installed (not included in package.json)

// It requires two environment variables: MONGODB_OLD and MONGODB_NEW

// Due to some big user profiles it needs more RAM than is allowed by default by v8 (arounf 1.7GB).
// Run the script with --max-old-space-size=4096 to allow up to 4GB of RAM
console.log('Starting migrations/api_v3/unsubscriptions.js.');

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
var EmailUnsubscription = require('../../website/server/models/emailUnsubscription').model;

// To be defined later when MongoClient connects
var mongoDbOldInstance;
var oldUnsubscriptionCollection;

var mongoDbNewInstance;
var newUnsubscriptionCollection;

var BATCH_SIZE = 1000;

var processedUnsubscriptions = 0;

// Only process unsubscriptions that fall in a interval ie -> up to 0000-4000-0000-0000
var AFTER_UNSUBSCRIPTION_ID = nconf.get('AFTER_UNSUBSCRIPTION_ID');
var BEFORE_UNSUBSCRIPTION_ID = nconf.get('BEFORE_UNSUBSCRIPTION_ID');

function processUnsubscriptions (afterId) {
  var processedTasks = 0;
  var lastUnsubscription = null;
  var oldUnsubscriptions;

  var query = {};

  if (BEFORE_UNSUBSCRIPTION_ID) {
    query._id = {$lte: BEFORE_UNSUBSCRIPTION_ID};
  }

  if ((afterId || AFTER_UNSUBSCRIPTION_ID) && !query._id) {
    query._id = {};
  }

  if (afterId) {
    query._id.$gt = afterId;
  } else if (AFTER_UNSUBSCRIPTION_ID) {
    query._id.$gt = AFTER_UNSUBSCRIPTION_ID;
  }

  var batchInsertUnsubscriptions = newUnsubscriptionCollection.initializeUnorderedBulkOp();

  console.log(`Executing unsubscriptions query.\nMatching unsubscriptions after ${afterId ? afterId : AFTER_UNSUBSCRIPTION_ID} and before ${BEFORE_UNSUBSCRIPTION_ID} (included).`);

  return oldUnsubscriptionCollection
  .find(query)
  .sort({_id: 1})
  .limit(BATCH_SIZE)
  .toArray()
  .then(function (oldUnsubscriptionsR) {
    oldUnsubscriptions = oldUnsubscriptionsR;

    console.log(`Processing ${oldUnsubscriptions.length} unsubscriptions. Already processed ${processedUnsubscriptions} unsubscriptions.`);

    if (oldUnsubscriptions.length === BATCH_SIZE) {
      lastUnsubscription = oldUnsubscriptions[oldUnsubscriptions.length - 1]._id;
    }

    oldUnsubscriptions.forEach(function (oldUnsubscription) {
      oldUnsubscription.email = oldUnsubscription.email.toLowerCase();
      var newUnsubscription = new EmailUnsubscription(oldUnsubscription);

      batchInsertUnsubscriptions.insert(newUnsubscription.toObject());
    });

    console.log(`Saving ${oldUnsubscriptions.length} unsubscriptions.`);

    return batchInsertUnsubscriptions.execute();
  })
  .then(function () {
    processedUnsubscriptions += oldUnsubscriptions.length;

    console.log(`Saved ${oldUnsubscriptions.length} unsubscriptions.`);

    if (lastUnsubscription) {
      return processUnsubscriptions(lastUnsubscription);
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
  oldUnsubscriptionCollection = mongoDbOldInstance.collection('emailunsubscriptions');

  mongoDbNewInstance = newInstance;
  newUnsubscriptionCollection = mongoDbNewInstance.collection('emailunsubscriptions');

  console.log(`Connected with MongoClient to ${MONGODB_OLD} and ${MONGODB_NEW}.`);

  return processUnsubscriptions();
})
.catch(function (err) {
  console.error(err.stack || err);
});
