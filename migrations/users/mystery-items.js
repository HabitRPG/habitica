import monk from 'monk';
import nconf from 'nconf';

const migrationName = 'mystery-items-201808.js'; // Update per month
const authorName = 'Sabe'; // in case script author needs to know when their ...
const authorUuid = '7f14ed62-5408-4e1b-be83-ada62d504931'; // ... own data is done

/*
 * Award this month's mystery items to subscribers
 */
const MYSTERY_ITEMS = ['armor_mystery_201810', 'head_mystery_201810'];
const CONNECTION_STRING = nconf.get('MIGRATION_CONNECT_STRING');

let dbUsers = monk(CONNECTION_STRING).get('users', { castIds: false });
let UserNotification = require('../../website/server/models/userNotification').model;

function processUsers (lastId) {
  // specify a query to limit the affected users (empty for all users):
  let query = {
    migration: {$ne: migrationName},
    'purchased.plan.customerId': { $ne: null },
    $or: [
      { 'purchased.plan.dateTerminated': { $gte: new Date() } },
      { 'purchased.plan.dateTerminated': { $exists: false } },
      { 'purchased.plan.dateTerminated': { $eq: null } },
    ],
  };

  if (lastId) {
    query._id = {
      $gt: lastId,
    };
  }

  dbUsers.find(query, {
    sort: {_id: 1},
    limit: 250,
    fields: [
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
    .then(() => {
      processUsers(lastUser._id);
    });
}

function updateUser (user) {
  count++;

  const addToSet = {
    'purchased.plan.mysteryItems': {
      $each: MYSTERY_ITEMS,
    },
  };
  const push = {
    notifications: (new UserNotification({
      type: 'NEW_MYSTERY_ITEMS',
      data: {
        MYSTERY_ITEMS,
      },
    })).toJSON(),
  };

  dbUsers.update({_id: user._id}, {$addToSet: addToSet, $push: push});

  if (count % progressCount === 0) console.warn(`${count  } ${  user._id}`);
  if (user._id === authorUuid) console.warn(`${authorName  } processed`);
}

function displayData () {
  console.warn(`\n${  count  } users processed\n`);
  return exiting(0);
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
