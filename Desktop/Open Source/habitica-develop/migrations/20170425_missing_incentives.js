var migrationName = '20170425_missing_incentives';
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
    'loginIncentives': {$gt:99},
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
  var inc = {
    'items.eggs.BearCub': 0,
    'items.eggs.Cactus': 0,
    'items.eggs.Dragon': 0,
    'items.eggs.FlyingPig': 0,
    'items.eggs.Fox': 0,
    'items.eggs.LionCub': 0,
    'items.eggs.PandaCub': 0,
    'items.eggs.TigerCub': 0,
    'items.eggs.Wolf': 0,
    'items.food.Chocolate': 0,
    'items.food.CottonCandyBlue': 0,
    'items.food.CottonCandyPink': 0,
    'items.food.Fish': 0,
    'items.food.Honey': 0,
    'items.food.Meat': 0,
    'items.food.Milk': 0,
    'items.food.Potatoe': 0,
    'items.food.RottenMeat': 0,
    'items.food.Strawberry': 0,
    'items.hatchingPotions.Base': 0,
    'items.hatchingPotions.CottonCandyBlue': 0,
    'items.hatchingPotions.CottonCandyPink': 0,
    'items.hatchingPotions.Desert': 0,
    'items.hatchingPotions.Golden': 0,
    'items.hatchingPotions.Red': 0,
    'items.hatchingPotions.RoyalPurple': 0,
    'items.hatchingPotions.Shade': 0,
    'items.hatchingPotions.Skeleton': 0,
    'items.hatchingPotions.White': 0,
    'items.hatchingPotions.Zombie': 0,
  };
  var nextReward;

  if (user.loginIncentives >= 105) {
    inc['items.hatchingPotions.RoyalPurple'] += 1;
    nextReward = 110;
  }
  if (user.loginIncentives >= 110) {
    inc['items.eggs.BearCub'] += 1;
    inc['items.eggs.Cactus'] += 1;
    inc['items.eggs.Dragon'] += 1;
    inc['items.eggs.FlyingPig'] += 1;
    inc['items.eggs.Fox'] += 1;
    inc['items.eggs.LionCub'] += 1;
    inc['items.eggs.PandaCub'] += 1;
    inc['items.eggs.TigerCub'] += 1;
    inc['items.eggs.Wolf'] += 1;
    nextReward = 115;
  }
  if (user.loginIncentives >= 115) {
    inc['items.hatchingPotions.RoyalPurple'] += 1;
    nextReward = 120;
  }
  if (user.loginIncentives >= 120) {
    inc['items.hatchingPotions.Base'] += 1;
    inc['items.hatchingPotions.CottonCandyBlue'] += 1;
    inc['items.hatchingPotions.CottonCandyPink'] += 1;
    inc['items.hatchingPotions.Desert'] += 1;
    inc['items.hatchingPotions.Golden'] += 1;
    inc['items.hatchingPotions.Red'] += 1;
    inc['items.hatchingPotions.Shade'] += 1;
    inc['items.hatchingPotions.Skeleton'] += 1;
    inc['items.hatchingPotions.White'] += 1;
    inc['items.hatchingPotions.Zombie'] += 1;
    nextReward = 125;
  }
  if (user.loginIncentives >= 125) {
    inc['items.hatchingPotions.RoyalPurple'] += 1;
    nextReward = 130;
  }
  if (user.loginIncentives >= 130) {
    inc['items.food.Chocolate'] += 3;
    inc['items.food.CottonCandyBlue'] += 3;
    inc['items.food.CottonCandyPink'] += 3;
    inc['items.food.Fish'] += 3;
    inc['items.food.Honey'] += 3;
    inc['items.food.Meat'] += 3;
    inc['items.food.Milk'] += 3;
    inc['items.food.Potatoe'] += 3;
    inc['items.food.RottenMeat'] += 3;
    inc['items.food.Strawberry'] += 3;
  }
  if (user.loginIncentives >= 135) {
    inc['items.hatchingPotions.RoyalPurple'] += 1;
    nextReward = 140;
  }
  if (user.loginIncentives >= 140) {
    set['items.gear.owned.weapon_special_skeletonKey'] = true;
    set['items.gear.owned.shield_special_lootBag'] = true;
    nextReward = 145;
  }
  if (user.loginIncentives >= 145) {
    inc['items.hatchingPotions.RoyalPurple'] += 1;
    nextReward = 150;
  }
  if (user.loginIncentives >= 150) {
    set['items.gear.owned.head_special_clandestineCowl'] = true;
    set['items.gear.owned.armor_special_sneakthiefRobes'] = true;
    nextReward = 155;
  }
  if (user.loginIncentives > 155) {
    set.loginIncentives = 155;
    nextReward = 160;
  }

  var push = {
    'notifications': {
      'type': 'LOGIN_INCENTIVE',
      'data': {
        'nextRewardAt': nextReward,
        'rewardKey': [
          'shop_armoire',
        ],
        'rewardText': common.i18n.t('checkInRewards', language),
        'reward': [],
        'message': common.i18n.t('backloggedCheckInRewards', language),
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
