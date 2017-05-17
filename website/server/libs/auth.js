import validator from 'validator';
import * as passwordUtils from './password';
import { async } from 'async';
import {
  model as User,
} from '../models/user';
import {
  NotAuthorized
} from './errors';

module.exports.checkCredentials = function (username, password, done) {
    let login;

    if (validator.isEmail(username)) {
      login = {'auth.local.email': username.toLowerCase()}; // Emails are stored lowercase
    } else {
      login = {'auth.local.username': username};
    }

    // load the entire user because we may have to save it to convert the password to bcrypt
    User.findOne(login).exec().then((user)=>{
      if (!user) {
        throw new NotAuthorized('invalidLoginCredentials');
      }
      passwordUtils.compare(user, password).then((isValidPassword)=>{
        if (!isValidPassword) throw new NotAuthorized('invalidLoginCredentials');

        // convert the hashed password to bcrypt from sha1
        if (user.auth.local.passwordHashMethod === 'sha1') {
          passwordUtils.convertToBcrypt(user, password).then(()=>{
            return user.save();
          }).then(()=>{
            return done(null, user);
          }).catch(done);
        } else {
          return done(null, user);
        }
      }).catch(done);
    }).catch(done);
  
};