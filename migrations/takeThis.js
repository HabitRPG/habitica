var migrationName = '20180102_takeThis.js'; // Update per month
var authorName = 'Sabe'; // in case script author needs to know when their ...
var authorUuid = '7f14ed62-5408-4e1b-be83-ada62d504931'; //... own data is done

/*
 * Award Take This ladder items to participants in this month's challenge
 */

var monk = require('monk');
var connectionString = 'mongodb://sabrecat:z8e8jyRA8CTofMQ@ds013393-a0.mlab.com:13393/habitica?auto_reconnect=true';
var dbUsers = monk(connectionString).get('users', { castIds: false });

function processUsers(lastId) {
  // specify a query to limit the affected users (empty for all users):
  var query = {
    'migration':{$ne:migrationName},
    'challenges':{$in:['5f70ce5b-2d82-4114-8e44-ca65615aae62']} // Update per month
  };

  if (lastId) {
    query._id = {
      $gt: lastId
    }
  }

  dbUsers.find(query, {
    sort: {_id: 1},
    limit: 250,
    fields: [
      'items.gear.owned',
    ] // specify fields we are interested in to limit retrieved data (empty if we're not reading data):
  })
  .then(updateUsers)
  .catch(function (err) {
    console.log(err);
    return exiting(1, 'ERROR! ' + err);
  });
}

var progressCount = 1000;
var count = 0;

function updateUsers (users) {
  if (!users || users.length === 0) {
    console.warn('All appropriate users found and modified.');
    displayData();
    return;
  }

  var userPromises = users.map(updateUser);
  var lastUser = users[users.length - 1];

  return Promise.all(userPromises)
  .then(function () {
    processUsers(lastUser._id);
  });
}

function updateUser (user) {
  count++;

  var set = {};

  if (typeof user.items.gear.owned.back_special_takeThis !== 'undefined') {
    set = {'migration':migrationName};
  } else if (typeof user.items.gear.owned.body_special_takeThis !== 'undefined') {
    set = {'migration':migrationName, 'items.gear.owned.back_special_takeThis':false};
    var push = {pinnedItems: {type: 'marketGear', path: 'gear.flat.back_special_takeThis', '_id': monk.id()}};
  } else if (typeof user.items.gear.owned.head_special_takeThis !== 'undefined') {
    set = {'migration':migrationName, 'items.gear.owned.body_special_takeThis':false};
    var push = {pinnedItems: {type: 'marketGear', path: 'gear.flat.body_special_takeThis', '_id': monk.id()}};
  } else if (typeof user.items.gear.owned.armor_special_takeThis !== 'undefined') {
    set = {'migration':migrationName, 'items.gear.owned.head_special_takeThis':false};
    var push = {pinnedItems: {type: 'marketGear', path: 'gear.flat.head_special_takeThis', '_id': monk.id()}};
  } else if (typeof user.items.gear.owned.weapon_special_takeThis !== 'undefined') {
    set = {'migration':migrationName, 'items.gear.owned.armor_special_takeThis':false};
    var push = {pinnedItems: {type: 'marketGear', path: 'gear.flat.armor_special_takeThis', '_id': monk.id()}};
  } else if (typeof user.items.gear.owned.shield_special_takeThis !== 'undefined') {
    set = {'migration':migrationName, 'items.gear.owned.weapon_special_takeThis':false};
    var push = {pinnedItems: {type: 'marketGear', path: 'gear.flat.weapon_special_takeThis', '_id': monk.id()}};
  } else {
    set = {'migration':migrationName, 'items.gear.owned.shield_special_takeThis':false};
    var push = {pinnedItems: {type: 'marketGear', path: 'gear.flat.shield_special_takeThis', '_id': monk.id()}};
  }

  if (push) {
    dbUsers.update({_id: user._id}, {$set: set, $push: push});
  } else {
    dbUsers.update({_id: user._id}, {$set: set});
  }

  if (count % progressCount == 0) console.warn(count + ' ' + user._id);
  if (user._id == authorUuid) console.warn(authorName + ' processed');
}

function displayData() {
  console.warn('\n' + count + ' users processed\n');
  return exiting(0);
}

function exiting(code, msg) {
  code = code || 0; // 0 = success
  if (code && !msg) { msg = 'ERROR!'; }
  if (msg) {
    if (code) { console.error(msg); }
    else      { console.log(  msg); }
  }
  process.exit(code);
}

module.exports = processUsers;
