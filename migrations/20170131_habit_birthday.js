var migrationName = '20170131_habit_birthday.js';
var authorName = 'Sabe'; // in case script author needs to know when their ...
var authorUuid = '7f14ed62-5408-4e1b-be83-ada62d504931'; //... own data is done

/*
 * Award 2017 party robes if user has 2016 robes, 2016 robes if they have the 2015 robes,
 * 2015 robes if they have the 2014 robes, and 2014 robes otherwise. Also cake!
 */

var monk = require('monk');
var connectionString = 'mongodb://localhost:27017/habitrpg?auto_reconnect=true'; // FOR TEST DATABASE
var dbUsers = monk(connectionString).get('users', { castIds: false });

function processUsers(lastId) {
  // specify a query to limit the affected users (empty for all users):
  var query = {
    'migration':{$ne:migrationName},
    'auth.timestamps.loggedin':{$gt:new Date('2017-01-24')}, // remove after first run to cover remaining users
  };

  if (lastId) {
    query._id = {
      $gt: lastId
    }
  }

  dbUsers.find(query, {
    sort: {_id: 1},
    limit: 250,
    fields: [ // specify fields we are interested in to limit retrieved data (empty if we're not reading data)
      'items.gear.owned'
    ],
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

  var set = {'migration':migrationName};
  if (user.items && user.items.gear && user.items.gear.owned && user.items.gear.owned.hasOwnProperty('armor_special_birthday2016')) {
    set['items.gear.owned.armor_special_birthday2017'] = false;
  } else if (user.items && user.items.gear && user.items.gear.owned && user.items.gear.owned.hasOwnProperty('armor_special_birthday2015')) {
    set['items.gear.owned.armor_special_birthday2016'] = false;
  } else if (user.items && user.items.gear && user.items.gear.owned && user.items.gear.owned.hasOwnProperty('armor_special_birthday')) {
    set['items.gear.owned.armor_special_birthday2015'] = false;
  } else {
    set['items.gear.owned.armor_special_birthday'] = false;
  }

  var inc = {
    'items.food.Cake_Skeleton':1,
    'items.food.Cake_Base':1,
    'items.food.Cake_CottonCandyBlue':1,
    'items.food.Cake_CottonCandyPink':1,
    'items.food.Cake_Shade':1,
    'items.food.Cake_White':1,
    'items.food.Cake_Golden':1,
    'items.food.Cake_Zombie':1,
    'items.food.Cake_Desert':1,
    'items.food.Cake_Red':1,
    'achievements.habitBirthdays':1
  };

  dbUsers.update({_id: user._id}, {$set:set, $inc:inc});

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
