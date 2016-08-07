'use strict';

/****************************************
 * Author: Blade Barringer @crookedneighbor
 *
 * Reason: Webhooks now support a type
 * property. Old webhooks are of type
 * "taskScored", so this migration updates
 * the data to have the correct type.
 ***************************************/

global.Promise = require('bluebird');
const TaskQueue = require('cwait').TaskQueue;
const logger = require('./utils/logger');
const Timer = require('./utils/timer');
const connectToDb = require('./utils/connect').connectToDb;
const closeDb = require('./utils/connect').closeDb;
const validator = require('validator');

const timer = new Timer();

// const DB_URI = 'mongodb://username:password@dsXXXXXX-a0.mlab.com:XXXXX,dsXXXXXX-a1.mlab.com:XXXXX/habitica?replicaSet=rs-dsXXXXXX';
const DB_URI = 'mongodb://localhost/prod-copy-4';

const LOGGEDIN_DATE_RANGE = {
  $gte: new Date("2014-01-01T00:00:00.000Z"),
  $lte: new Date("2014-06-01T00:00:00.000Z"),
};

let Users;

connectToDb(DB_URI).then((db) => {
  Users = db.collection('users');

  return Promise.resolve();
})
.then(findUsersWithWebhooks)
.then(correctWebhooks)
.then(() => {
  timer.stop();
  closeDb();
}).catch(reportError);

function reportError (err) {
  logger.error('Uh oh, an error occurred');
  closeDb();
  timer.stop();
  throw err;
}

// Cached ids of users that need updating
const USER_IDS = require('../ids.json');

function findUsersWithWebhooks () {
  logger.warn('Fetching users with webhooks...');

  return Users.find({'_id': {$in: USER_IDS}}, ['preferences.webhooks']).toArray().then((docs) => {
  // return Users.find({'preferences.webhooks': {$ne: {} }}, ['preferences.webhooks']).toArray().then((docs) => {
  // TODO: Run this after the initial migration to catch any webhooks that may have been aded since the prod backup download
  // return Users.find({'preferences.webhooks': {$ne: {} }, 'auth.timestamps.loggedin': {$gte: new Date("2016-08-04T00:00:00.000Z")}}, ['preferences.webhooks']).toArray().then((docs) => {
    docs.forEach((user) => {
      let webhooks = user.preferences.webhooks;
      Object.keys(webhooks).forEach((id) => {
        let webhook = webhooks[id]

        if (!webhook.type) {
          webhook.type = 'taskScored';
        }
      });
    });

    return Promise.resolve(docs);
  });
}

function updateUserById (user) {
  return Users.findOneAndUpdate({
    _id: user._id},
    {$set: {'preferences.webhooks': user.preferences.webhooks}
  }, {returnOriginal: false})
}

function correctWebhooks (users) {
  let queue = new TaskQueue(Promise, 300);

  logger.warn('About to update', users.length, 'users...');

  return Promise.map(users, queue.wrap(updateUserById)).then((result) => {
    let updates = result.filter(res => res.lastErrorObject && res.lastErrorObject.updatedExisting)
    let failures = result.filter(res => !(res.lastErrorObject && res.lastErrorObject.updatedExisting));

    logger.warn(updates.length, 'users have been fixed');

    if (failures.length > 0) {
      logger.error(failures.length, 'users could not be found');
    }

    return Promise.resolve();
  });
}
