var migrationName = '20160831_takeThis.js';
var authorName = 'Sabe'; // in case script author needs to know when their ...
var authorUuid = '7f14ed62-5408-4e1b-be83-ada62d504931'; //... own data is done

/*
 * Award Take This Sword to Take This challenge participants who already own the Shield
 * and Take This Shield to the rest of the list 
 */

var mongo = require('mongoskin');

var connectionString = 'mongodb://localhost:27017/habitrpg?auto_reconnect=true'; // FOR TEST DATABASE

var dbUsers = mongo.db(connectionString).collection('users');

// specify a query to limit the affected users (empty for all users):
var query = {
  'migration':{$ne:migrationName},
  'challenges':{$in:['ee2b3c87-13f0-422a-af3c-309102d4f7e6']}
};

// specify fields we are interested in to limit retrieved data (empty if we're not reading data):
var fields = {
  'items.gear.owned': 1
};

console.warn('Updating users...');
var progressCount = 1000;
var count = 0;
dbUsers.findEach(query, fields, {batchSize:250}, function(err, user) {
  if (err) { return exiting(1, 'ERROR! ' + err); }
  if (!user) {
    console.warn('All appropriate users found and modified.');
    setTimeout(displayData, 300000);
    return;
  }
  count++;

  // specify user data to change:
  var set = {};

  if (typeof user.items.gear.owned.weapon_special_takeThis !== 'undefined') {
    set = {'migration':migrationName, 'items.gear.owned.armor_special_takeThis':false};
  } else if (typeof user.items.gear.owned.shield_special_takeThis !== 'undefined') {
    set = {'migration':migrationName, 'items.gear.owned.weapon_special_takeThis':false};
  } else {
    set = {'migration':migrationName, 'items.gear.owned.shield_special_takeThis':false};
  }

  dbUsers.update({_id:user._id}, {$set:set});

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

