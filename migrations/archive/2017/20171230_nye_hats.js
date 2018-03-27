let migrationName = '20171230_nye_hats.js';
let authorName = 'Sabe'; // in case script author needs to know when their ...
let authorUuid = '7f14ed62-5408-4e1b-be83-ada62d504931'; // ... own data is done

/*
 * Award New Year's Eve party hats to users in sequence
 */

let monk = require('monk');
let connectionString = 'mongodb://localhost:27017/habitrpg?auto_reconnect=true'; // FOR TEST DATABASE
let dbUsers = monk(connectionString).get('users', { castIds: false });

function processUsers (lastId) {
  // specify a query to limit the affected users (empty for all users):
  let query = {
    migration: {$ne: migrationName},
    'auth.timestamps.loggedin': {$gt: new Date('2017-11-30')},
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
    ], // specify fields we are interested in to limit retrieved data (empty if we're not reading data):
  })
    .then(updateUsers)
    .catch(function (err) {
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
    .then(function () {
      processUsers(lastUser._id);
    });
}

function updateUser (user) {
  count++;

  let set = {};
  let push = {};

  if (typeof user.items.gear.owned.head_special_nye2016 !== 'undefined') {
    set = {migration: migrationName, 'items.gear.owned.head_special_nye2017': false};
    push = {pinnedItems: {type: 'marketGear', path: 'gear.flat.head_special_nye2017', _id: monk.id()}};
  } else if (typeof user.items.gear.owned.head_special_nye2015 !== 'undefined') {
    set = {migration: migrationName, 'items.gear.owned.head_special_nye2016': false};
    push = {pinnedItems: {type: 'marketGear', path: 'gear.flat.head_special_nye2016', _id: monk.id()}};
  } else if (typeof user.items.gear.owned.head_special_nye2014 !== 'undefined') {
    set = {migration: migrationName, 'items.gear.owned.head_special_nye2015': false};
    push = {pinnedItems: {type: 'marketGear', path: 'gear.flat.head_special_nye2015', _id: monk.id()}};
  } else if (typeof user.items.gear.owned.head_special_nye !== 'undefined') {
    set = {migration: migrationName, 'items.gear.owned.head_special_nye2014': false};
    push = {pinnedItems: {type: 'marketGear', path: 'gear.flat.head_special_nye2014', _id: monk.id()}};
  } else {
    set = {migration: migrationName, 'items.gear.owned.head_special_nye': false};
    push = {pinnedItems: {type: 'marketGear', path: 'gear.flat.head_special_nye', _id: monk.id()}};
  }

  dbUsers.update({_id: user._id}, {$set: set, $push: push});

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
