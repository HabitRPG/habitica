import {
  NotAuthorized,
  BadRequest,
} from '../libs/errors';
import {
  model as User,
} from '../models/user';
import nconf from 'nconf';
import passport from 'passport';

const COMMUNITY_MANAGER_EMAIL = nconf.get('EMAILS:COMMUNITY_MANAGER_EMAIL');

// Strins won't be translated here because getUserLanguage has not run yet

// Authenticate a request through the x-api-user and x-api key header
// If optional is true, don't error on missing authentication
export function authWithHeaders (optional = false, blacklisted = false) {
  return function authWithHeadersHandler (req, res, next) {
    let search = {};
    let authToken = req.header('Authorization');

    if (authToken) {
      // if Authorization header is set, use bearer passport strategy to get user
      return passport.authenticate('bearer', { session: false }, (err, user) => {
        if (err) return next(err);
        if (!user) return next(new NotAuthorized(res.t('invalidCredentials')));
        if (user.auth.blocked) return next(new NotAuthorized(res.t('accountSuspended', {communityManagerEmail: COMMUNITY_MANAGER_EMAIL, userId: user._id})));
        if (blacklisted) {
          return next(new BadRequest('You are not allowed to perform this action.'));
        }

        res.locals.user = user;

        req.session.userId = user._id;
        return next();
      })(req, res, next);
    } else {
      let userId = req.header('x-api-user');
      let apiToken = req.header('x-api-key');

      if (!userId || !apiToken) {
        if (optional) return next();
        return next(new NotAuthorized(res.t('missingAuthHeaders')));
      }
      search = {
        _id: userId,
        apiToken,
      };
    }

    return User.findOne(search)
    .exec()
    .then((user) => {
      if (!user) throw new NotAuthorized(res.t('invalidCredentials'));
      if (user.auth.blocked) throw new NotAuthorized(res.t('accountSuspended', {communityManagerEmail: COMMUNITY_MANAGER_EMAIL, userId: user._id}));

      res.locals.user = user;

      req.session.userId = user._id;
      return next();
    })
    .catch(next);
  };
}

// Authenticate a request through a valid session
export function authWithSession (req, res, next) {
  let userId = req.session.userId;

  // Always allow authentication with headers
  if (!userId) {
    if (!req.header('x-api-user') || !req.header('x-api-key')) {
      return next(new NotAuthorized(res.t('invalidCredentials')));
    } else {
      return authWithHeaders()(req, res, next);
    }
  }

  return User.findOne({
    _id: userId,
  })
  .exec()
  .then((user) => {
    if (!user) throw new NotAuthorized(res.t('invalidCredentials'));

    res.locals.user = user;
    return next();
  })
  .catch(next);
}

export function authWithUrl (req, res, next) {
  let userId = req.query._id;
  let apiToken = req.query.apiToken;

  // Always allow authentication with headers
  if (!userId || !apiToken) {
    if (!req.header('x-api-user') || !req.header('x-api-key')) {
      return next(new NotAuthorized(res.t('missingAuthParams')));
    } else {
      return authWithHeaders()(req, res, next);
    }
  }

  return User.findOne({ _id: userId, apiToken }).exec()
  .then((user) => {
    if (!user) throw new NotAuthorized(res.t('invalidCredentials'));

    res.locals.user = user;
    return next();
  })
  .catch(next);
}
