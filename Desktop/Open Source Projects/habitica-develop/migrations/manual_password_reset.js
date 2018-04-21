// EMAIL="x@y.com" node ./migrations/manual_password_reset.js
// Be sure to have PRODUCTION_DB in your config.json

// IMPORTANT: this script isn't updated to use the new password encryption that uses bcrypt
// using it will break accounts and should not be used until upgraded

var nconf = require('nconf'),
  path = require('path');
nconf.argv().env().file('user', path.join(path.resolve(__dirname, '../config.json')));

var Users = require('mongoskin').db(nconf.get("PRODUCTION_DB:URL"), nconf.get("PRODUCTION_DB").CREDS).collection('users'),
  async = require('async'),
  utils = require('../website/server/utils'),
  salt = utils.makeSalt(),
  newPassword =  utils.makeSalt(), // use a salt as the new password too (they'll change it later)
  hashed_password = utils.encryptPassword(newPassword, salt);

async.waterfall([
  function(cb){
    Users.findItems({'auth.local.email':nconf.get("EMAIL")}, {auth:1}, cb);
  },
  function(users, cb){
    if (users.length<1) return cb("User not found for that email");
    if (users.length>1) return cb("Multiple users for that email");
    var user = users[0];
    console.dir({username:user.auth.local.username, password: newPassword});
    Users.update({_id:user._id}, {
      $set:{
        'auth.local.salt': salt,
        'auth.local.hashed_password': hashed_password,
        'preferences.sleep': true
      }
    }, cb)
  }
], function(err){
  if (err) console.log(err);
  process.exit()
});