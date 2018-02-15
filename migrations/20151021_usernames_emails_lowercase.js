/*
 * Migrate email to lowerCase version and add auth.local.lowerCaseUsername email
 */

let mongo = require('mongoskin');
let async = require('async');

let dbserver = 'url';
let dbname = 'dbname';
let countUsers = 0;

let db = mongo.db(`${dbserver  }/${  dbname  }?auto_reconnect`);
let dbUsers = db.collection('users');

console.log('Begins work on db');

function findUsers (gt) {
  let query = {};
  if (gt) query._id = {$gt: gt};

  console.log(query);

  dbUsers.find(query, {
    fields: {_id: 1, auth: 1},
    limit: 10000,
    sort: {
      _id: 1,
    },
  }).toArray(function (err, users) {
    if (err) throw err;

    let lastUser = null;
    if (users.length === 10000) {
      lastUser = users[users.length - 1];
    }

    async.eachLimit(users, 20, function (user, cb) {
      countUsers++;
      console.log('User: ', countUsers, user._id);

      let update = {
        $set: {},
      };

      if (user.auth && user.auth.local) {
        if (user.auth.local.username) update.$set['auth.local.lowerCaseUsername'] = user.auth.local.username.toLowerCase();
        if (user.auth.local.email) update.$set['auth.local.email'] = user.auth.local.email.toLowerCase();
      }

      dbUsers.update({
        _id: user._id,
      }, update, cb);
    }, function (err) {
      if (err) throw err;

      if (lastUser && lastUser._id) {
        findUsers(lastUser._id);
      }
    });
  });
}

findUsers();
