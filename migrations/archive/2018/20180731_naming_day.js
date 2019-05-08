let migrationName = '20180731_naming-day.js'; // Update when running in future years
let authorName = 'Sabe'; // in case script author needs to know when their ...
let authorUuid = '7f14ed62-5408-4e1b-be83-ada62d504931'; // ... own data is done

/*
 * Award Naming Day ladder items to participants in this month's Naming Day festivities
 */

import monk from 'monk';
import nconf from 'nconf';
const CONNECTION_STRING = nconf.get('MIGRATION_CONNECT_STRING'); // FOR TEST DATABASE
let dbUsers = monk(CONNECTION_STRING).get('users', { castIds: false });

function processUsers (lastId) {
  // specify a query to limit the affected users (empty for all users):
  let query = {
    migration: {$ne: migrationName},
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
      'items.gear.owned',
      'items.mounts',
      'items.pets',
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

  let set = {};
  let push;

  const inc = {
    'items.food.Cake_Base': 1,
    'items.food.Cake_CottonCandyBlue': 1,
    'items.food.Cake_CottonCandyPink': 1,
    'items.food.Cake_Desert': 1,
    'items.food.Cake_Golden': 1,
    'items.food.Cake_Red': 1,
    'items.food.Cake_Shade': 1,
    'items.food.Cake_Skeleton': 1,
    'items.food.Cake_White': 1,
    'items.food.Cake_Zombie': 1,
    'achievements.habiticaDays': 1,
  };

  if (user && user.items && user.items.gear && user.items.gear.owned && typeof user.items.gear.owned.head_special_namingDay2017 !== 'undefined') {
    set = {migration: migrationName, 'items.gear.owned.body_special_namingDay2018': false};
    push = {pinnedItems: {type: 'marketGear', path: 'gear.flat.body_special_namingDay2018', _id: monk.id()}};
  } else if (user && user.items && user.items.pets && typeof user.items.pets['Gryphon-RoyalPurple'] !== 'undefined') {
    set = {migration: migrationName, 'items.gear.owned.head_special_namingDay2017': false};
    push = {pinnedItems: {type: 'marketGear', path: 'gear.flat.head_special_namingDay2017', _id: monk.id()}};
  } else if (user && user.items && user.items.mounts && typeof user.items.mounts['Gryphon-RoyalPurple'] !== 'undefined') {
    set = {migration: migrationName, 'items.pets.Gryphon-RoyalPurple': 5};
  } else {
    set = {migration: migrationName, 'items.mounts.Gryphon-RoyalPurple': true};
  }

  if (push) {
    dbUsers.update({_id: user._id}, {$set: set, $push: push, $inc: inc});
  } else {
    dbUsers.update({_id: user._id}, {$set: set, $inc: inc});
  }

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
