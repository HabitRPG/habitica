var migrationName = '20161122_turkey_ladder.js';
var authorName = 'Sabe'; // in case script author needs to know when their ...
var authorUuid = '7f14ed62-5408-4e1b-be83-ada62d504931'; //... own data is done

/*
 * Yearly Turkey Day award. Turkey pet, Turkey mount, Gilded Turkey pet, Gilded Turkey mount
 */

var mongo = require('mongoskin');

var connectionString = 'mongodb://localhost:27017/habitrpg?auto_reconnect=true'; // FOR TEST DATABASE

var dbUsers = mongo.db(connectionString).collection('users');

// specify a query to limit the affected users (empty for all users):
var query = {
  'migration':{$ne:migrationName},
  'auth.timestamps.loggedin':{$gt:new Date('2016-10-31')} // Extend timeframe each run of migration
};

// specify fields we are interested in to limit retrieved data (empty if we're not reading data):
var fields = {
  'migration': 1,
  'items.mounts': 1,
  'items.pets': 1,
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

  if (user.items.pets['Turkey-Gilded']) {
    set = {'migration':migrationName, 'items.mounts.Turkey-Gilded':true};
  } else if (user.items.mounts['Turkey-Base']) {
    set = {'migration':migrationName, 'items.pets.Turkey-Gilded':5};
  } else if (user.items.pets['Turkey-Base']) {
    set = {'migration':migrationName, 'items.mounts.Turkey-Base':true};
  } else {
    set = {'migration':migrationName, 'items.pets.Turkey-Base':5};
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
