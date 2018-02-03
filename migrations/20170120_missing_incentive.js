var migrationName = '20170120_missing_incentive.js';
var authorName = 'Sabe'; // in case script author needs to know when their ...
var authorUuid = '7f14ed62-5408-4e1b-be83-ada62d504931'; //... own data is done

/*
 * Award missing Royal Purple Hatching Potion to users with 55+ check-ins
 * Reduce users with impossible check-in counts to a reasonable number
 */

import monk from 'monk';
import common from '../website/common';

var connectionString = 'mongodb://localhost:27017/habitrpg?auto_reconnect=true'; // FOR TEST DATABASE
var dbUsers = monk(connectionString).get('users', { castIds: false });

function processUsers(lastId) {
  // specify a query to limit the affected users (empty for all users):
  var query = {
    'loginIncentives': {$gt:54},
    'migration': {$ne: migrationName},
  };

  if (lastId) {
    query._id = {
      $gt: lastId
    }
  }

  dbUsers.find(query, {
    sort: {_id: 1},
    limit: 250,
    fields: [] // specify fields we are interested in to limit retrieved data (empty if we're not reading data):
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

  var language = user.preferences.language || 'en';
  var set = {'migration': migrationName};
  var inc = {'items.hatchingPotions.RoyalPurple': 1};
  if (user.loginIncentives > 58) {
    set = {'migration': migrationName, 'loginIncentives': 58};
  }
  var push = {
    'notifications': {
      'type': 'LOGIN_INCENTIVE',
      'data': {
        'nextRewardAt': 60,
        'rewardKey': [
          'Pet_HatchingPotion_Purple',
        ],
        'rewardText': common.i18n.t('potion', {potionType: common.i18n.t('hatchingPotionRoyalPurple', language)}, language),
        'reward': [
          {
            'premium': true,
            'key': 'RoyalPurple',
            'limited': true,
            'value': 2,
          }
        ],
        'message': common.i18n.t('unlockedCheckInReward', language),
      },
      'id': common.uuid(),
    }
  };

  dbUsers.update({_id: user._id}, {$set:set, $push:push, $inc:inc});

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
