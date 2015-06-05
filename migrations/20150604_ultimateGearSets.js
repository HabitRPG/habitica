/**
 * Created by Sabe on 6/3/2015.
 */

var migrationName = '20150604_ultimateGearSets';
var authorName = process.env.AUTHOR_NAME || 'Sabe'; // in case script author needs to know when their ...
var authorUuid = process.env.AUTHOR_UUID || '7f14ed62-5408-4e1b-be83-ada62d504931'; //... own data is done

/*
 * grant the new ultimateGearSets achievement for existing users' collected equipment
 */

var dbserver = process.env.DB_SERVER || 'localhost:27017'; // CHANGE THIS FOR PRODUCTION DATABASE
var dbname = process.env.DB_NAME || 'habitrpg';

var mongo = require('mongoskin');
var _ = require('lodash');

var dbUsers = mongo.db(dbserver + '/' + dbname + '?auto_reconnect').collection('users');

var fields = {
  'achievements.ultimateGearSets':1
};

var query = {
  'items.gear.owned.weapon_wizard_6': {$exists: true},
  'items.gear.owned.armor_wizard_5': {$exists: true},
  'items.gear.owned.head_wizard_5': {$exists: true}
};

/* var query = {
  'items.gear.owned.weapon_warrior_6': {$exists: true},
  'items.gear.owned.armor_warrior_5': {$exists: true},
  'items.gear.owned.head_warrior_5': {$exists: true},
  'items.gear.owned.shield_warrior_5': {$exists: true}
}; */

/* var query = {
 'items.gear.owned.weapon_healer_6': {$exists: true},
 'items.gear.owned.armor_healer_5': {$exists: true},
 'items.gear.owned.head_healer_5': {$exists: true},
 'items.gear.owned.shield_healer_5': {$exists: true}
}; */

/* var query = {
 'items.gear.owned.weapon_rogue_6': {$exists: true},
 'items.gear.owned.armor_rogue_5': {$exists: true},
 'items.gear.owned.head_rogue_5': {$exists: true},
 'items.gear.owned.shield_rogue_6': {$exists: true}
}; */

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

  var set = {'migration':migrationName, 'achievements.ultimateGearSets.wizard':true}; // Change per class
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
