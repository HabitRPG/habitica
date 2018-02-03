'use strict';

/****************************************
 * Author: Blade Barringer @crookedneighbor
 *
 * Reason: Old code didn't properly validate email
 * addresses, so we have some users in the db
 * that do not have valid emails. When a party
 * or challenge attempts to save the user,
 * the validation fails. This collects
 * the bad emails and changes the email to
 * <userid>@example.com
 ***************************************/

global.Promise = require('bluebird');
const TaskQueue = require('cwait').TaskQueue;
const logger = require('./utils/logger');
const Timer = require('./utils/timer');
const connectToDb = require('./utils/connect').connectToDb;
const closeDb = require('./utils/connect').closeDb;
const validator = require('validator');

const timer = new Timer();

const DB_URI = 'mongodb://username:password@dsXXXXXX-a0.mlab.com:XXXXX,dsXXXXXX-a1.mlab.com:XXXXX/habitica?replicaSet=rs-dsXXXXXX';

let Users;

connectToDb(DB_URI).then((db) => {
  Users = db.collection('users');

  return Promise.resolve();
})
// cached the lookup as a json file
// .then(findUsersWithBadEmails)
.then(correctEmails)
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

function findUsersWithBadEmails (users) {
  logger.warn('Fetching users with bad emails...');

  return Users.find({'auth.local.email': {$exists: true}}, ['auth.local.email']).toArray().then((docs) => {
    let invalidEmails = docs.filter((user) => {
      return !validator.isEmail(user.auth.local.email);
    });

    let result = invalidEmails.map((user) => {
      return { _id: user._id, email: user.auth.local.email };
    });

    logger.warn('number of invalid emails:', invalidEmails.length)
    console.log(result)

    return Promise.resolve(invalidEmails);
  });
}

function updateUserById (user) {
  return Users.findOneAndUpdate({
    _id: user._id},
    {$set: {'auth.local.email': user._id + '@example.com'}
  }, {returnOriginal: false})
}

// cached lookup of bad emails
const emails = require('../email_logs.json');

function correctEmails () {
  let queue = new TaskQueue(Promise, 300);

  logger.warn('About to update', emails.length, 'user email addresses...');

  return Promise.map(emails, queue.wrap(updateUserById)).then((result) => {
    let updates = result.filter(res => res.lastErrorObject && res.lastErrorObject.updatedExisting)
    let failures = result.filter(res => !(res.lastErrorObject && res.lastErrorObject.updatedExisting));

    logger.warn(updates.length, 'users have been fixed');

    if (failures.length > 0) {
      logger.error(failures.length, 'users could not be found');
    }

    return Promise.resolve();
  });
}
