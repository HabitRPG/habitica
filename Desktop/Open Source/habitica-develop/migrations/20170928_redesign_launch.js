import { selectGearToPin } from '../website/common/script/ops/pinnedGearUtils';

var getItemInfo = require('../website/common/script/libs/getItemInfo');

var migrationName = '20170928_redesign_launch.js';
var authorName = 'paglias'; // in case script author needs to know when their ...
var authorUuid = 'ed4c688c-6652-4a92-9d03-a5a79844174a'; //... own data is done

/*
 * Migrate existing in app rewards lists to pinned items
 * Award Veteran Pets
 */

var monk = require('monk');
var connectionString = 'mongodb://localhost:27017/habitrpg?auto_reconnect=true'; // FOR TEST DATABASE
var dbUsers = monk(connectionString).get('users', { castIds: false });

function processUsers(lastId) {
  // specify a query to limit the affected users (empty for all users):
  var query = {
    'migration': {$ne:migrationName},
    'auth.timestamps.loggedin': {$gt: new Date('2017-09-21')},
  };

  var fields = {
    'items.pets': 1,
    'items.gear': 1,
    'stats.class': 1,
  }

  if (lastId) {
    query._id = {
      $gt: lastId
    }
  }

  return dbUsers.find(query, {
    fields: fields,
    sort: {_id: 1},
    limit: 250,
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

  var oldRewardsList = selectGearToPin(user);
  var newPinnedItems = [
    {
      type: 'armoire',
      path: 'armoire',
    },
    {
      type: 'potion',
      path: 'potion',
    },
  ];

  oldRewardsList.forEach(item => {
    var type = 'marketGear';

    var itemInfo = getItemInfo(user, 'marketGear', item);
    newPinnedItems.push({
      type,
      path: itemInfo.path,
    })
  });

  set.pinnedItems = newPinnedItems;

  if (user.items.pets['Lion-Veteran']) {
    set['items.pets.Bear-Veteran'] = 5;
  } else if (user.items.pets['Tiger-Veteran']) {
    set['items.pets.Lion-Veteran'] = 5;
  } else if (user.items.pets['Wolf-Veteran']) {
    set['items.pets.Tiger-Veteran'] = 5;
  } else {
    set['items.pets.Wolf-Veteran'] = 5;
  }

  if (count % progressCount == 0) console.warn(count + ' ' + user._id);
  if (user._id == authorUuid) console.warn(authorName + ' processed');

  return dbUsers.update({_id: user._id}, {$set:set});
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
