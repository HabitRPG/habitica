var migrationName = 'restore_profile_data.js';
var authorName = 'ThehollidayInn'; // in case script author needs to know when their ...
var authorUuid = ''; //... own data is done

/*
 * Check if users have empty profile data in new database and update it with old database info
 */

var mongo = require('mongoskin');
var connectionString = 'mongodb://thehollidayinn_danger:A!s2d3F$@ds013393-a0.mlab.com:13393,ds013393-a1.mlab.com:13393/habitica?replicaSet=rs-ds013393&auto_reconnect=true'; // FOR TEST DATABASE
var dbUsers = mongo.db(connectionString).collection('users');

var oldDbConnectionString = 'mongodb://localhost:27017/habitrpg?auto_reconnect=true'; // FOR TEST DATABASE
var olDbUsers = mongo.db(oldDbConnectionString).collection('users');

// specify a query to limit the affected users (empty for all users):
var query = {
  'profile.name': 'profile name not found',
};

// specify fields we are interested in to limit retrieved data (empty if we're not reading data):
var fields = {
  'profile': 1,
};

var options = {
  batchSize: 250,
  // limit: 250,
  sort: {'auth.timestamps.created': -1}
};

var progressCount = 1000;
var count = 0;
dbUsers.findEach(query, fields, options, function(err, user) {
  if (err) { return exiting(1, 'ERROR! ' + err); }
  if (!user) {
    console.warn('All appropriate users found and modified.');
    setTimeout(displayData, 300000);
    return;
  }
  count++;

  if (!user.profile.name || user.profile.name === 'profile name not found' || !user.profile.imageUrl || !user.profile.blurb) {
    // console.log("Update this user", user);
    olDbUsers.findOne({_id: user._id}, function (err, oldUserData) {
      if (err || !oldUserData) return;

      // specify user data to change:
      var set = {};

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
        dbUsers.update({_id:user._id}, {$set:set});
      }
    });
  }

  if (count%progressCount == 0) console.warn(count + ' ' + user._id);
  if (user._id == authorUuid) console.warn(authorName + ' processed');
});


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
