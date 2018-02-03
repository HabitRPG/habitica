var migrationName = '20170731_naming_day.js';
var authorName = 'Sabe'; // in case script author needs to know when their ...
var authorUuid = '7f14ed62-5408-4e1b-be83-ada62d504931'; //... own data is done

/*
 * Award Royal Purple Gryphon Helm to Royal Purple Gryphon pet owners,
 * award Royal Purple Gryphon pet to Royal Purple Gryphon mount owners,
 * award Royal Purple Gryphon mount to everyone else
 */

var monk = require('monk');
var connectionString = 'mongodb://localhost:27017/habitrpg?auto_reconnect=true'; // FOR TEST DATABASE
var dbUsers = monk(connectionString).get('users', { castIds: false });

function processUsers(lastId) {
  // specify a query to limit the affected users (empty for all users):
  var query = {
    'migration':{$ne:migrationName},
    'auth.timestamps.loggedin': {$gt: new Date('2017-01-01')},
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
      'items.mounts',
      'items.pets',
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
  var inc = {
    'achievements.habiticaDays': 1,
    'items.food.Cake_Skeleton': 1,
    'items.food.Cake_Base': 1,
    'items.food.Cake_CottonCandyBlue': 1,
    'items.food.Cake_CottonCandyPink': 1,
    'items.food.Cake_Shade': 1,
    'items.food.Cake_White': 1,
    'items.food.Cake_Golden': 1,
    'items.food.Cake_Zombie': 1,
    'items.food.Cake_Desert': 1,
    'items.food.Cake_Red': 1
  };

  if (user.items.pets['Gryphon-RoyalPurple']) {
    set = {'migration':migrationName, 'items.gear.owned.head_special_namingDay2017': false};
  } else if (user.items.mounts['Gryphon-RoyalPurple']) {
    set = {'migration':migrationName, 'items.pets.Gryphon-RoyalPurple': 5};
  } else {
    set = {'migration':migrationName, 'items.mounts.Gryphon-RoyalPurple': true};
  }

  dbUsers.update({_id: user._id}, {$set: set, $inc: inc});

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
