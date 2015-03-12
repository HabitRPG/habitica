// node ./migrations/manual_password_reset.js

//TODO: CHANGE
var dbserver = 'mongodb://node-a0.server.com:port/habitrpg', //Note, only include primary set
  creds = {username:'', password:''},
  email = '';

var utils = require('../website/src/utils'),
  salt = utils.makeSalt(),
  newPassword =  utils.makeSalt(), // use a salt as the new password too (they'll change it later)
  hashed_password = utils.encryptPassword(newPassword, salt);
console.log(newPassword);
require('mongoskin').db(dbserver, creds).collection('users')
  .update({'auth.local.email':email}, {
    $set:{
      'auth.local.salt': salt,
      'auth.local.hashed_password': hashed_password
    }
  }, process.exit);
