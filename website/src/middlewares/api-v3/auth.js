// Middlewares used to authenticate requests
import {
  NotAuthorized,
} from '../../libs/api-v3/errors';

import {
  model as User,
} from '../../models/user';

// TODO use i18n
const missingAuthHeaders = 'Missing authentication headers.';
const userNotFound = 'User not found.';
const accountSuspended = (user) => {
  return `Account has been suspended, please contact leslie@habitica.com
   with your UUID ${user._id} for assistance.`;
};

// TODO adopt JSDoc syntax?
// Authenticate a request through the x-api-user and x-api key header
export function authWithHeaders (req, res, next) {
  let userId = req.header['x-api-user'];
  let apiToken = req.header['x-api-key'];

  if (!userId || !apiToken) {
    // TODO use i18n?
    // TODO use badrequest error?
    return next(new NotAuthorized(missingAuthHeaders));
  }

  User.findOne({
    _id: userId,
    apiToken,
  })
  .exec()
  .then((user) => {
    if (!user) return next(new NotAuthorized(userNotFound));

    // TODO better handling for this case
    if (user.blocked) return next(new NotAuthorized(accountSuspended(user)));

    res.locals.user = user;
    // TODO use either session/cookie or headers, not both
    req.session.userId = user._id;
    return next();
  })
  .catch(next);
}

// Authenticate a request through a valid session
// TODO should use json web token
export function authWithSession (req, res, next) {
  let userId = req.session.userId;

  if (!userId) return next(new NotAuthorized(userNotFound));

  User.findOne({
    _id: userId,
  })
  .exec()
  .then((user) => {
    if (!user) return next(new NotAuthorized(userNotFound));

    res.locals.user = user;
    return next();
  })
  .catch(next);
}