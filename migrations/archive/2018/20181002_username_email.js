const MIGRATION_NAME = '20181003_username_email.js';
let authorName = 'Sabe'; // in case script author needs to know when their ...
let authorUuid = '7f14ed62-5408-4e1b-be83-ada62d504931'; // ... own data is done

/*
 * Send emails to eligible users announcing upcoming username changes
 */

import monk from 'monk';
import nconf from 'nconf';
import { sendTxn } from '../../website/server/libs/email';
const CONNECTION_STRING = nconf.get('MIGRATION_CONNECT_STRING');
let dbUsers = monk(CONNECTION_STRING).get('users', { castIds: false });

function processUsers (lastId) {
  // specify a query to limit the affected users (empty for all users):
  let query = {
    migration: {$ne: MIGRATION_NAME},
    'auth.timestamps.loggedin': {$gt: new Date('2018-04-01')},
  };

  if (lastId) {
    query._id = {
      $gt: lastId,
    };
  }

  dbUsers.find(query, {
    sort: {_id: 1},
    limit: 100,
    fields: [
      '_id',
      'auth',
      'preferences',
      'profile',
    ], // specify fields we are interested in to limit retrieved data (empty if we're not reading data):
  })
    .then(updateUsers)
    .catch((err) => {
      console.log(err);
      return exiting(1, `ERROR! ${  err}`);
    });
}

let progressCount = 1000;
let count = 0;

function updateUsers (users) {
  if (!users || users.length === 0) {
    console.warn('All appropriate users found and modified.');
    displayData();
    return;
  }

  let userPromises = users.map(updateUser);
  let lastUser = users[users.length - 1];

  return Promise.all(userPromises)
    .then(() => delay(7000))
    .then(() => {
      processUsers(lastUser._id);
    });
}

function updateUser (user) {
  count++;

  dbUsers.update({_id: user._id}, {$set: {migration: MIGRATION_NAME}});

  sendTxn(
    user,
    'username-change',
    [{name: 'UNSUB_EMAIL_TYPE_URL', content: '/user/settings/notifications?unsubFrom=importantAnnouncements'},
     {name: 'LOGIN_NAME', content: user.auth.local.username}]
  );

  if (count % progressCount === 0) console.warn(`${count} ${user._id}`);
  if (user._id === authorUuid) console.warn(`${authorName} processed`);
}

function displayData () {
  console.warn(`\n${count} users processed\n`);
  return exiting(0);
}

function delay (t, v) {
  return new Promise(function batchPause (resolve) {
    setTimeout(resolve.bind(null, v), t);
  });
}

function exiting (code, msg) {
  code = code || 0; // 0 = success
  if (code && !msg) {
    msg = 'ERROR!';
  }
  if (msg) {
    if (code) {
      console.error(msg);
    } else      {
      console.log(msg);
    }
  }
  process.exit(code);
}

module.exports = processUsers;
