const UserNotification = require('../website/server/models/userNotification').model;
const content = require('../website/common/script/content/index');

const migrationName = '20180125_clean_new_migrations';
const authorName = 'paglias'; // in case script author needs to know when their ...
const authorUuid = 'ed4c688c-6652-4a92-9d03-a5a79844174a'; // ... own data is done

/*
 * Clean new migration types for processed users
 */

const monk = require('monk');
const connectionString = 'mongodb://localhost:27017/habitrpg?auto_reconnect=true'; // FOR TEST DATABASE
const dbUsers = monk(connectionString).get('users', { castIds: false });

const progressCount = 1000;
let count = 0;

function updateUser (user) {
  count++;

  const types = ['NEW_MYSTERY_ITEMS', 'CARD_RECEIVED', 'NEW_CHAT_MESSAGE'];

  dbUsers.update({_id: user._id}, {
    $pull: {notifications: { type: {$in: types } } },
    $set: {migration: migrationName},
  });

  if (count % progressCount === 0) console.warn(`${count  } ${  user._id}`);
  if (user._id === authorUuid) console.warn(`${authorName  } processed`);
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

function displayData () {
  console.warn(`\n${  count  } users processed\n`);
  return exiting(0);
}

function updateUsers (users) {
  if (!users || users.length === 0) {
    console.warn('All appropriate users found and modified.');
    displayData();
    return;
  }

  const userPromises = users.map(updateUser);
  const lastUser = users[users.length - 1];

  return Promise.all(userPromises)
    .then(() => {
      processUsers(lastUser._id);
    });
}

function processUsers (lastId) {
  // specify a query to limit the affected users (empty for all users):
  const query = {
    migration: {$ne: migrationName},
    'auth.timestamps.loggedin': {$gt: new Date('2010-01-24')},
  };

  if (lastId) {
    query._id = {
      $gt: lastId,
    };
  }

  dbUsers.find(query, {
    sort: {_id: 1},
    limit: 250,
  })
    .then(updateUsers)
    .catch((err) => {
      console.log(err);
      return exiting(1, `ERROR! ${  err}`);
    });
}

module.exports = processUsers;
