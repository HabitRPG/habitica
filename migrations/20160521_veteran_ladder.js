var migrationName = '20160521_veteran_ladder.js';
var authorName = 'Sabe'; // in case script author needs to know when their ...
var authorUuid = '7f14ed62-5408-4e1b-be83-ada62d504931'; //... own data is done

/*
 * Award Gilded Turkey pet to Turkey mount owners, Turkey Mount if they only have Turkey Pet,
 * and Turkey Pet otherwise
 */

var dbserver = 'localhost:27017'; // FOR TEST DATABASE
// var dbserver = 'username:password@ds031379-a0.mongolab.com:31379'; // FOR PRODUCTION DATABASE
var dbname = 'habitrpg';

var mongo = require('mongoskin');
var _ = require('lodash');

// IMPORTANT NOTE: this migration was written when we were using version 3 of lodash.
// We've now upgraded to lodash v4 but the code used in this migration has not been
// adapted to work with it. Before this migration is used again any lodash method should
// be checked for compatibility against the v4 changelog and changed if necessary.
// https://github.com/lodash/lodash/wiki/Changelog#v400

var dbUsers = mongo.db(dbserver + '/' + dbname + '?auto_reconnect').collection('users');

// specify a query to limit the affected users (empty for all users):
var query = {
  'auth.timestamps.loggedin':{$gt:new Date('2016-05-01')} // remove when running migration a second time
};

// specify fields we are interested in to limit retrieved data (empty if we're not reading data):
var fields = {
  'migration': 1,
  'items.pets.Wolf-Veteran': 1,
  'items.pets.Tiger-Veteran': 1
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
  var set = {};
  if (user.migration !== migrationName) {
    if (user.items.pets['Tiger-Veteran']) {
      set = {'migration':migrationName, 'items.pets.Lion-Veteran':5};
    } else if (user.items.pets['Wolf-Veteran']) {
      set = {'migration':migrationName, 'items.pets.Tiger-Veteran':5}; 
    } else {
      set = {'migration':migrationName, 'items.pets.Wolf-Veteran':5}; 
    }
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

