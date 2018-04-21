var migrationName = 'restore_profile_data.js';
var authorName = 'ThehollidayInn'; // in case script author needs to know when their ...
var authorUuid = ''; //... own data is done

/*
 * Check if users have empty profile data in new database and update it with old database info
 */

var monk = require('monk');
var connectionString = ''; // FOR TEST DATABASE
var dbUsers = monk(connectionString).get('users', { castIds: false });

var monk2 = require('monk');
var oldDbConnectionString = 'mongodb://localhost:27017/habitrpg?auto_reconnect=true'; // FOR TEST DATABASE
var olDbUsers = monk2(oldDbConnectionString).get('users', { castIds: false });

function processUsers(lastId)
{
  // specify a query to limit the affected users (empty for all users):
  var query = {
    // 'profile.name': 'profile name not found',
    'profile.blurb': null,
    // 'auth.timestamps.loggedin': {$gt: new Date('11/30/2016')},
  };

  if (lastId) {
    query._id = {
      $gt: lastId
    }
  }

  dbUsers.find(query, {
    sort: {_id: 1},
    limit: 250,
    fields: ['_id', 'profile', 'auth.timestamps.loggedin'] // specify fields we are interested in to limit retrieved data (empty if we're not reading data):
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
    setTimeout(displayData, 300000);
    return;
  }

  var userPaymentPromises = users.map(updateUser);
  var lastUser = users[users.length - 1];

  return Promise.all(userPaymentPromises)
  .then(function () {
    processUsers(lastUser._id);
  });
}

function updateUser (user) {
  count++;

  if (!user.profile.name || user.profile.name === 'profile name not found' || !user.profile.imageUrl || !user.profile.blurb) {
    return olDbUsers.findOne({_id: user._id}, '_id profile')
      .then((oldUserData) => {
        if (!oldUserData) return;
        // specify user data to change:
        var set = {};

        if (oldUserData.profile.name === 'profile name not found') return;

        var userNeedsProfileName = !user.profile.name || user.profile.name === 'profile name not found';
        if (userNeedsProfileName && oldUserData.profile.name) {
          set['profile.name'] = oldUserData.profile.name;
        }

        if (!user.profile.imageUrl && oldUserData.profile.imageUrl) {
          set['profile.imageUrl'] = oldUserData.profile.imageUrl;
        }

        if (!user.profile.blurb && oldUserData.profile.blurb) {
          set['profile.blurb'] = oldUserData.profile.blurb;
        }

        if (Object.keys(set).length !== 0 && set.constructor === Object) {
          console.log(set)
          return dbUsers.update({_id: user._id}, {$set:set});
        }
      });
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


processUsers()
