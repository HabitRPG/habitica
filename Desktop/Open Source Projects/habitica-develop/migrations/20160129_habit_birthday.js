var migrationName = '20160129_habit_birthday.js';
var authorName = 'Sabe'; // in case script author needs to know when their ...
var authorUuid = '7f14ed62-5408-4e1b-be83-ada62d504931'; //... own data is done

/*
 * Award 2016 party robes if user has 2015 robes, 2015 robes if they have the 2014 robes,
 * and 2014 robes otherwise
 */

var dbserver = 'localhost:27017'; // FOR TEST DATABASE
// var dbserver = 'username:password@ds031379-a0.mongolab.com:31379'; // FOR PRODUCTION DATABASE
var dbname = 'habitrpg';

// IMPORTANT NOTE: this migration was written when we were using version 3 of lodash.
// We've now upgraded to lodash v4 but the code used in this migration has not been
// adapted to work with it. Before this migration is used again any lodash method should
// be checked for compatibility against the v4 changelog and changed if necessary.
// https://github.com/lodash/lodash/wiki/Changelog#v400

var mongo = require('mongoskin');
var _ = require('lodash');

var dbUsers = mongo.db(dbserver + '/' + dbname + '?auto_reconnect').collection('users');

// specify a query to limit the affected users (empty for all users):
var query = {
};

// specify fields we are interested in to limit retrieved data (empty if we're not reading data):
var fields = {
  'items.gear.owned': 1,
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

  // specify user data to change:
  var set = {'migration':migrationName};
  if (user.items && user.items.gear && user.items.gear.owned && user.items.gear.owned.hasOwnProperty('armor_special_birthday2015')) {
    set['items.gear.owned.armor_special_birthday2016'] = false;
  } else if (user.items && user.items.gear && user.items.gear.owned && user.items.gear.owned.hasOwnProperty('armor_special_birthday')) {
    set['items.gear.owned.armor_special_birthday2015'] = false;
  } else {
    set['items.gear.owned.armor_special_birthday'] = false;
  }

  var inc = {
    'items.food.Cake_Skeleton':1,
    'items.food.Cake_Base':1,
    'items.food.Cake_CottonCandyBlue':1,
    'items.food.Cake_CottonCandyPink':1,
    'items.food.Cake_Shade':1,
    'items.food.Cake_White':1,
    'items.food.Cake_Golden':1,
    'items.food.Cake_Zombie':1,
    'items.food.Cake_Desert':1,
    'items.food.Cake_Red':1,
    'achievements.habitBirthdays':1
  };

  dbUsers.update({_id:user._id}, {$set:set});
  dbUsers.update({_id:user._id}, {$inc:inc});

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
