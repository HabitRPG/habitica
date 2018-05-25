var migrationName = '20171030_jackolanterns.js';
var authorName = 'Sabe'; // in case script author needs to know when their ...
var authorUuid = '7f14ed62-5408-4e1b-be83-ada62d504931'; //... own data is done

/*
 * Award the Jack-O'-Lantern ladder:
 * Ghost Jack-O-Lantern Mount to owners of Ghost Jack-O-Lantern Pet
 * Ghost Jack-O-Lantern Pet to owners of Jack-O-Lantern Mount
 * Jack-O-Lantern Mount to owners of Jack-O-Lantern Pet
 * Jack-O-Lantern Pet to everyone else
 */

var monk = require('monk');
var connectionString = 'mongodb://localhost:27017/habitrpg?auto_reconnect=true'; // FOR TEST DATABASE
var dbUsers = monk(connectionString).get('users', { castIds: false });

function processUsers(lastId) {
  // specify a query to limit the affected users (empty for all users):
  var query = {
    'migration':{$ne:migrationName},
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
  var inc = {
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

  if (user && user.items && user.items.pets && user.items.pets['JackOLantern-Ghost']) {
    set = {'migration':migrationName, 'items.mounts.JackOLantern-Ghost': true};
  } else if (user && user.items && user.items.mounts && user.items.mounts['JackOLantern-Base']) {
    set = {'migration':migrationName, 'items.pets.JackOLantern-Ghost': 5};
  } else if (user && user.items && user.items.pets && user.items.pets['JackOLantern-Base']) {
    set = {'migration':migrationName, 'items.mounts.JackOLantern-Base': true};
  } else {
    set = {'migration':migrationName, 'items.pets.JackOLantern-Base': 5};
  }

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
