/*
 * Award Habitoween ladder items to participants in this month's Habitoween festivities
 */

import monk from 'monk';
import nconf from 'nconf';
const MIGRATION_NAME = '20181030_habitoween_ladder.js'; // Update when running in future years
const CONNECTION_STRING = nconf.get('MIGRATION_CONNECT_STRING');
const AUTHOR_NAME = 'Sabe'; // in case script author needs to know when their ...
const AUTHOR_UUID = '7f14ed62-5408-4e1b-be83-ada62d504931'; // ... own data is done

let dbUsers = monk(CONNECTION_STRING).get('users', { castIds: false });

function processUsers (lastId) {
  // specify a query to limit the affected users (empty for all users):
  let query = {
    migration: {$ne: MIGRATION_NAME},
    'auth.timestamps.loggedin': {$gt: new Date('2018-10-01')},
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
      'items.mounts',
      'items.pets',
    ], // specify fields we are interested in to limit retrieved data (empty if we're not reading data):
  })
    .then(updateUsers)
    .catch((err) => {
      console.log(err);
      return exiting(1, `ERROR! ${err}`);
    });
}

const PROGRESS_COUNT = 1000;
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

  let set = {};
  let inc = {
    'items.food.Candy_Skeleton': 1,
    'items.food.Candy_Base': 1,
    'items.food.Candy_CottonCandyBlue': 1,
    'items.food.Candy_CottonCandyPink': 1,
    'items.food.Candy_Shade': 1,
    'items.food.Candy_White': 1,
    'items.food.Candy_Golden': 1,
    'items.food.Candy_Zombie': 1,
    'items.food.Candy_Desert': 1,
    'items.food.Candy_Red': 1,
  };

  if (user && user.items && user.items.pets && user.items.mounts['JackOLantern-Ghost']) {
    set['items.pets.JackOLantern-Glow'] = 5;
  } else if (user && user.items && user.items.pets && user.items.pets['JackOLantern-Ghost']) {
    set['items.mounts.JackOLantern-Ghost'] = true;
  } else if (user && user.items && user.items.mounts && user.items.mounts['JackOLantern-Base']) {
    set['items.pets.JackOLantern-Ghost'] = 5;
  } else if (user && user.items && user.items.pets && user.items.pets['JackOLantern-Base']) {
    set['items.mounts.JackOLantern-Base'] = true;
  } else {
    set['items.pets.JackOLantern-Base'] = 5;
  }

  dbUsers.update({_id: user._id}, {$set: set, $inc: inc});

  if (count % PROGRESS_COUNT === 0) console.warn(`${count} ${user._id}`);
  if (user._id === AUTHOR_UUID) console.warn(`${AUTHOR_NAME} processed`);
}

function displayData () {
  console.warn(`\n${count} users processed\n`);
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
