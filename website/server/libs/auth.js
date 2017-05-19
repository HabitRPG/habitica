import validator from 'validator';
import * as passwordUtils from './password';
import {
  model as User,
} from '../models/user';
import {
  NotAuthorized,
} from './errors';

module.exports.checkCredentials = function checkCredentials (username, password, done) {
  let login;

  if (validator.isEmail(username)) {
    login = {'auth.local.email': username.toLowerCase()}; // Emails are stored lowercase
  } else {
    login = {'auth.local.username': username};
  }
  let foundUser;
  // load the entire user because we may have to save it to convert the password to bcrypt
  return User.findOne(login).exec().then((user) => {
    if (!user) {
      throw new NotAuthorized('invalidLoginCredentials');
    }
    foundUser = user;
    return passwordUtils.compare(user, password);
  }).then((isValidPassword) => {
    if (!isValidPassword) throw new NotAuthorized('invalidLoginCredentials');

    // convert the hashed password to bcrypt from sha1
    if (foundUser.auth.local.passwordHashMethod === 'sha1') {
      passwordUtils.convertToBcrypt(foundUser, password).then(() => {
        return foundUser.save();
      }).then(() => {
        return done(null, foundUser);
      }).catch(done);
    } else {
      return done(null, foundUser);
    }
  }).catch(done);
};