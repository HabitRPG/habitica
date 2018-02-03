var migrationName = '20171117_turkey_ladder.js';
var authorName = 'Sabe'; // in case script author needs to know when their ...
var authorUuid = '7f14ed62-5408-4e1b-be83-ada62d504931'; //... own data is done

/*
 * Award the Turkey Day ladder:
 * Grant Turkey Costume to those who have the Gilded Turkey mount
 * Grant Gilded Turkey mount to those who have the Gilded Turkey pet
 * Grant Gilded Turkey pet to those who have the Base Turkey mount
 * Grant Base Turkey mount to those who have the Base Turkey pet
 * Grant Base Turkey pet to those who have none of the above yet
 */

var monk = require('monk');
var connectionString = 'mongodb://localhost:27017/habitrpg?auto_reconnect=true'; // FOR TEST DATABASE
var dbUsers = monk(connectionString).get('users', { castIds: false });

function processUsers(lastId) {
  // specify a query to limit the affected users (empty for all users):
  var query = {
    'migration':{$ne:migrationName},
    'auth.timestamps.loggedin':{$gt:new Date('2017-11-01')},
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
      'items.pets',
      'items.mounts',
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

  if (user && user.items && user.items.mounts && user.items.mounts['Turkey-Gilded']) {
    set = {
      migration: migrationName,
      'items.gear.owned.head_special_turkeyHelmBase': false,
      'items.gear.owned.armor_special_turkeyArmorBase': false,
      'items.gear.owned.back_special_turkeyTailBase': false,
    };
    var push = [
      {
        type: 'marketGear',
        path: 'gear.flat.head_special_turkeyHelmBase',
        _id: monk.id(),
      },
      {
        type: 'marketGear',
        path: 'gear.flat.armor_special_turkeyArmorBase',
        _id: monk.id(),
      },
      {
        type: 'marketGear',
        path: 'gear.flat.back_special_turkeyTailBase',
        _id: monk.id(),
      },
    ];
  } else if (user && user.items && user.items.pets && user.items.pets['Turkey-Gilded']) {
    set = {'migration':migrationName, 'items.mounts.Turkey-Gilded':true};
  } else if (user && user.items && user.items.mounts && user.items.mounts['Turkey-Base']) {
    set = {'migration':migrationName, 'items.pets.Turkey-Gilded':5};
  } else if (user && user.items && user.items.pets && user.items.pets['Turkey-Base']) {
    set = {'migration':migrationName, 'items.mounts.Turkey-Base':true};
  } else {
    set = {'migration':migrationName, 'items.pets.Turkey-Base':5};
  }

  dbUsers.update({_id: user._id}, {$set: set});
  if (push) {
    dbUsers.update({_id: user._id}, {$push: {pinnedItems: {$each: push}}});
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
