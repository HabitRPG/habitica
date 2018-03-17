var migrationName = '20171211_sanitize_emails.js';
var authorName = 'Julius'; // in case script author needs to know when their ...
var authorUuid = 'dd16c270-1d6d-44bd-b4f9-737342e79be6'; //... own data is done

/*
  User creation saves email as lowercase, but updating an email did not.
  Run this script to ensure all lowercased emails in db AFTER fix for updating emails is implemented.
  This will fix inconsistent querying for an email when attempting to password reset.
*/

var monk = require('monk');
var connectionString = 'mongodb://localhost:27017/habitrpg?auto_reconnect=true'; // FOR TEST DATABASE
var dbUsers = monk(connectionString).get('users', { castIds: false });

function processUsers(lastId) {
  var query = {
    'auth.local.email': /[A-Z]/
  };

  if (lastId) {
    query._id = {
      $gt: lastId
    }
  }

  dbUsers.find(query, {
    sort: {_id: 1},
    limit: 250,
    fields: [ // specify fields we are interested in to limit retrieved data (empty if we're not reading data)
      'auth.local.email'
    ],
  })
  .then(updateUsers)
  .catch(function (err) {
    console.log(err);
    return exiting(1, 'ERROR! ' + err);
  });
}

var progressCount = 1000;
var count = 0;

function updateUsers (users) {
  if (!users || users.length === 0) {
    console.warn('All appropriate users found and modified.');
    displayData();
    return;
  }

  var userPromises = users.map(updateUser);
  var lastUser = users[users.length - 1];

  return Promise.all(userPromises)
  .then(function () {
    processUsers(lastUser._id);
  });
}

function updateUser (user) {
  count++;

  var push;
  var set = {
    'auth.local.email': user.auth.local.email.toLowerCase()
  };

  dbUsers.update({_id: user._id}, {$set: set});

  if (count % progressCount == 0) console.warn(count + ' ' + user._id);
  if (user._id == authorUuid) console.warn(authorName + ' processed');
}

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

module.exports = processUsers;
