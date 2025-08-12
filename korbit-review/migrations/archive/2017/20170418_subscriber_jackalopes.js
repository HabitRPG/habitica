let migrationName = '20170418_subscriber_jackalopes.js';
let authorName = 'Sabe'; // in case script author needs to know when their ...
let authorUuid = '7f14ed62-5408-4e1b-be83-ada62d504931'; // ... own data is done

/*
 * Award Royal Purple Jackalope pet to all current subscribers
 */

let monk = require('monk');
let connectionString = 'mongodb://localhost:27017/habitrpg?auto_reconnect=true'; // FOR TEST DATABASE
let dbUsers = monk(connectionString).get('users', { castIds: false });
let now = new Date();

function processUsers (lastId) {
  // specify a query to limit the affected users (empty for all users):
  let query = {
    'purchased.plan.customerId': {$type: 2},
    $or: [
      {'purchased.plan.dateTerminated': null},
      {'purchased.plan.dateTerminated': {$exists: false}},
      {'purchased.plan.dateTerminated': {$gt: now}},
    ],
  };

  if (lastId) {
    query._id = {
      $gt: lastId,
    };
  }

  dbUsers.find(query, {
    sort: {_id: 1},
    limit: 250,
    fields: [], // specify fields we are interested in to limit retrieved data (empty if we're not reading data):
  })
    .then(updateUsers)
    .catch(function (err) {
      console.log(err);
      return exiting(1, `ERROR! ${  err}`);
    });
}

let progressCount = 1000;
let count = 0;

function updateUsers (users) {
  if (!users || users.length === 0) {
    console.warn('All appropriate users found and modified.');
    displayData();
    return;
  }

  let userPromises = users.map(updateUser);
  let lastUser = users[users.length - 1];

  return Promise.all(userPromises)
    .then(function () {
      processUsers(lastUser._id);
    });
}

function updateUser (user) {
  count++;

  let set = {'items.pets.Jackalope-RoyalPurple': 5};

  dbUsers.update({_id: user._id}, {$set: set});

  if (count % progressCount === 0) console.warn(`${count  } ${  user._id}`);
  if (user._id === authorUuid) console.warn(`${authorName  } processed`);
}

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

module.exports = processUsers;
