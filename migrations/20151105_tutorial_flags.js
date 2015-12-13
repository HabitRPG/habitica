var migrationName = '20151105_tutorial_flags_v1';
var authorName = 'Alys'; // in case script author needs to know when their ...
var authorUuid = 'd904bd62-da08-416b-a816-ba797c9ee265'; //... own data is done

/*
 * set flags.tutorial.ios and flags.tutorial.main flags to true in preparation
 * for the release of a new iOS tutorial
 *
 */

// var dbserver = 'localhost:27017' // FOR TEST DATABASE
var dbserver = 'alys:@ds031379-a0.mongolab.com:31379' // FOR PRODUCTION DATABASE
var dbname = 'habitrpg';

var mongo = require('mongoskin');
var _ = require('lodash');

var dbUsers = mongo.db(dbserver + '/' + dbname + '?auto_reconnect').collection('users');

var fields = {
};


var query = {
    'auth.timestamps.loggedin':{$gt:new Date('2015-10-20')}
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

  // var set = {'migration':migrationName, 'flags.tutorial.ios':true, 'flags.tutorial.main':true };
  var set = {'migration':migrationName, 'flags.tutorial.ios':{} };

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
