import Q from 'q';
import { model as User } from '../../models/user';

export function isEqual (first, second) {
  return first === second;
}

export function isUniqueUsername (username) {
  if (!username) return true;

  let lowerCaseUsername = username.toLowerCase();

  let userQuery = User.findOne({
    'auth.local.lowerCaseUsername': lowerCaseUsername,
  }).exec();

  return Q.promise((resolve, reject) => {
    userQuery.then((user) => {
      if (user) {
        reject();
      } else {
        resolve();
      }
    });
  });
}

export function isUniqueEmail (email) {
  if (!email) return true;

  let lowerCaseEmail = email.toLowerCase();

  let userQuery = User.findOne({
    'auth.local.email': lowerCaseEmail,
  }).exec();

  return Q.promise((resolve, reject) => {
    userQuery.then((user) => {
      if (user) {
        reject();
      } else {
        resolve();
      }
    });
  });
}
