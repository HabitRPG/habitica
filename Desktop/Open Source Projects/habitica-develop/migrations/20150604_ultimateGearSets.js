// var migrationName = '20150604_ultimateGearSets';
// var authorName = 'Sabe'; // in case script author needs to know when their ...
// var authorUuid = '7f14ed62-5408-4e1b-be83-ada62d504931'; //... own data is done

var migrationName = '20150620_ultimateGearSets';
var authorName = 'Alys'; // in case script author needs to know when their ...
var authorUuid = 'd904bd62-da08-416b-a816-ba797c9ee265'; //... own data is done

/*
 * grant the new ultimateGearSets achievement for existing users' collected equipment
 *
 *
 * Changed by Alys on 20150620 to assign false values to
 * 'achievements.ultimateGearSets' when true values are not appropriate,
 * because of https://github.com/HabitRPG/habitrpg/issues/5427
 *
 * Minimal changes were made so the code isn't as efficient or clean
 * as it could be, but it's (hopefully) one-use-only and minimal changes
 * means minimal new testing.
 */

// IMPORTANT NOTE: this migration was written when we were using version 3 of lodash.
// We've now upgraded to lodash v4 but the code used in this migration has not been
// adapted to work with it. Before this migration is used again any lodash method should
// be checked for compatibility against the v4 changelog and changed if necessary.
// https://github.com/lodash/lodash/wiki/Changelog#v400

var dbserver = 'localhost:27017' // FOR TEST DATABASE
// var dbserver = 'username:password@ds031379-a0.mongolab.com:31379' // FOR PRODUCTION DATABASE
var dbname = 'habitrpg';

var mongo = require('mongoskin');
var _ = require('lodash');

var dbUsers = mongo.db(dbserver + '/' + dbname + '?auto_reconnect').collection('users');

var fields = {
  'achievements.ultimateGearSets':1,
  'items.gear.owned':1
};


// Changes 20150620: All users have to be processed now (non-achievers need
// false values).
var query = {
};

console.warn('Updating users...');
var progressCount = 1000;
var count = 0;
dbUsers.findEach(query, fields, {batchSize:250}, function(err, user) {
  if (err) { return exiting(1, 'ERROR! ' + err); }
  if (!user) {
    console.warn('All appropriate users found and modified.');
    return displayData();
  }
  count++;

  var achievements = {};
  var changeUser = false;
  // Changes 20150620: 'changeUser' now indicates that the user must have the
  // Enchanted Armoire unlocked.
  if (   (typeof user.items.gear.owned.weapon_wizard_6 !== 'undefined')
      && (typeof user.items.gear.owned.armor_wizard_5 !== 'undefined')
      && (typeof user.items.gear.owned.head_wizard_5 !== 'undefined')
  ) {
    achievements['wizard'] = true;
    changeUser = true;
  }
  else {
    // Changes 20150620: false added for all classes (here and below)
    achievements['wizard'] = false;
  }

  if (   (typeof user.items.gear.owned.weapon_warrior_6 !== 'undefined')
      && (typeof user.items.gear.owned.armor_warrior_5 !== 'undefined')
      && (typeof user.items.gear.owned.head_warrior_5 !== 'undefined')
      && (typeof user.items.gear.owned.shield_warrior_5 !== 'undefined')
  ) {
    achievements['warrior'] = true;
    changeUser = true;
  }
  else {
    achievements['warrior'] = false;
  }

  if (   (typeof user.items.gear.owned.weapon_healer_6 !== 'undefined')
      && (typeof user.items.gear.owned.armor_healer_5 !== 'undefined')
      && (typeof user.items.gear.owned.head_healer_5 !== 'undefined')
      && (typeof user.items.gear.owned.shield_healer_5 !== 'undefined')
  ) {
    achievements['healer'] = true;
    changeUser = true;
  }
  else {
    achievements['healer'] = false;
  }

  if (   (typeof user.items.gear.owned.weapon_rogue_6 !== 'undefined')
      && (typeof user.items.gear.owned.armor_rogue_5 !== 'undefined')
      && (typeof user.items.gear.owned.head_rogue_5 !== 'undefined')
      && (typeof user.items.gear.owned.shield_rogue_6 !== 'undefined')
  ) {
    achievements['rogue'] = true;
    changeUser = true;
  }
  else {
    achievements['rogue'] = false;
  }

  // Changes 20150620: $set is now run for all users.
  var set = {'migration':migrationName, 'achievements.ultimateGearSets':achievements};
  if (changeUser) { // user has at least one Ultimate Gear achievement
    set['flags.armoireEnabled'] = true;
  }
  dbUsers.update({_id:user._id}, {$set:set});

  if (count%progressCount == 0) console.warn(count + ' ' + user._id);
  if (user._id == authorUuid) console.warn(authorName + ' processed');
  if (user._id == '9'       ) console.warn('lefnire'  + ' processed');
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
