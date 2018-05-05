var migrationName = '20170616_achievements';
var authorName = 'Sabe'; // in case script author needs to know when their ...
var authorUuid = '7f14ed62-5408-4e1b-be83-ada62d504931'; //... own data is done

/*
 * Updates to achievements for June 16, 2017 biweekly merge
 * 1. Multiply various collection quest achievements based on difficulty reduction
 * 2. Award Joined Challenge achievement to those who should have it already
 */

import monk from 'monk';

var connectionString = 'mongodb://localhost:27017/habitrpg?auto_reconnect=true'; // FOR TEST DATABASE
var dbUsers = monk(connectionString).get('users', { castIds: false });

function processUsers(lastId) {
  // specify a query to limit the affected users (empty for all users):
  var query = {
    $or: [
      {'achievements.quests.dilatoryDistress1': {$gt:0}},
      {'achievements.quests.egg': {$gt:0}},
      {'achievements.quests.goldenknight1': {$gt:0}},
      {'achievements.quests.moonstone1': {$gt:0}},
      {'achievements.quests.vice2': {$gt:0}},
      {'achievements.challenges': {$exists: true, $ne: []}},
      {'challenges': {$exists: true, $ne: []}},
    ],
  };

  if (lastId) {
    query._id = {
      $gt: lastId
    }
  }

  dbUsers.find(query, {
    sort: {_id: 1},
    limit: 250,
    fields: [ // specify fields we are interested in to limit retrieved data (empty if we're not reading data):
      'achievements',
      'challenges',
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
  var set = {'migration': migrationName};

  if (user.challenges.length > 0 || user.achievements.challenges.length > 0) {
    set['achievements.joinedChallenge'] = true;
  }
  if (user.achievements.quests.dilatoryDistress1) {
    set['achievements.quests.dilatoryDistress1'] = Math.ceil(user.achievements.quests.dilatoryDistress1 * 1.25);
  }
  if (user.achievements.quests.egg) {
    set['achievements.quests.egg'] = Math.ceil(user.achievements.quests.egg * 2.5);
  }
  if (user.achievements.quests.goldenknight1) {
    set['achievements.quests.goldenknight1'] = user.achievements.quests.goldenknight1 * 5;
  }
  if (user.achievements.quests.moonstone1) {
    set['achievements.quests.moonstone1'] = user.achievements.quests.moonstone1 * 5;
  }
  if (user.achievements.quests.vice2) {
    set['achievements.quests.vice2'] = Math.ceil(user.achievements.quests.vice2 * 1.5);
  }

  dbUsers.update({_id: user._id}, {$set:set});

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
