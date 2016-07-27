var migrationName = '20160731_naming_day.js';
var authorName = 'Sabe'; // in case script author needs to know when their ...
var authorUuid = '7f14ed62-5408-4e1b-be83-ada62d504931'; //... own data is done

/*
 * Award Royal Purple Gryphon pet to Royal Purple Gryphon mount owners, mount to everyone else
 */

var mongo = require('mongoskin');

var connectionString = 'mongodb://localhost:27017/habitrpg?auto_reconnect=true'; // FOR TEST DATABASE

var dbUsers = mongo.db(connectionString).collection('users');

// specify a query to limit the affected users (empty for all users):
var query = {
  'auth.timestamps.loggedin':{$gt:new Date('2016-07-31')} // remove when running migration a second time
};

// specify fields we are interested in to limit retrieved data (empty if we're not reading data):
var fields = {
  'migration': 1,
  'items.mounts.Gryphon-RoyalPurple': 1
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
    if (user.items.mounts['Gryphon-RoyalPurple']) {
      set = {'migration':migrationName, 'items.pets.Gryphon-RoyalPurple':5};
    } else {
      set = {'migration':migrationName, 'items.mounts.Gryphon-RoyalPurple':true}; 
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

