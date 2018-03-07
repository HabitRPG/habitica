let migrationName = '20151013_jackolanterns.js';
let authorName = 'Sabe'; // in case script author needs to know when their ...
let authorUuid = '7f14ed62-5408-4e1b-be83-ada62d504931'; // ... own data is done

/*
 * Award Jack-O'-Lantern mounts to users who already have the pet version, award pet if they don't
 */

let dbserver = 'localhost:27017'; // FOR TEST DATABASE
// var dbserver = 'username:password@ds031379-a0.mongolab.com:31379'; // FOR PRODUCTION DATABASE
let dbname = 'habitrpg';

let mongo = require('mongoskin');
let _ = require('lodash');

let dbUsers = mongo.db(`${dbserver  }/${  dbname  }?auto_reconnect`).collection('users');

// specify a query to limit the affected users (empty for all users):
let query = {
};

// specify fields we are interested in to limit retrieved data (empty if we're not reading data):
let fields = {
  'items.pets.JackOLantern-Base': 1,
};

console.warn('Updating users...');
let progressCount = 1000;
let count = 0;
dbUsers.findEach(query, fields, {batchSize: 250}, function (err, user) {
  if (err) {
    return exiting(1, `ERROR! ${  err}`);
  }
  if (!user) {
    console.warn('All appropriate users found and modified.');
    return displayData();
  }
  count++;

  // specify user data to change:
  let set = {};
  if (user.items.pets['JackOLantern-Base']) {
    set = {migration: migrationName, 'items.mounts.JackOLantern-Base': true};
  } else {
    set = {migration: migrationName, 'items.pets.JackOLantern-Base': 5};
  }

  dbUsers.update({_id: user._id}, {$set: set});

  if (count % progressCount === 0) console.warn(`${count  } ${  user._id}`);
  if (user._id === authorUuid) console.warn(`${authorName  } processed`);
});


function displayData () {
  console.warn(`\n${  count  } users processed\n`);
  return exiting(0);
}


function exiting (code, msg) {
  code = code || 0; // 0 = success
  if (code && !msg) {
    msg = 'ERROR!';
  }
  if (msg) {
    if (code) {
      console.error(msg);
    } else      {
      console.log(msg);
    }
  }
  process.exit(code);
}
