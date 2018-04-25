import {
  NotAuthorized,
} from '../libs/errors';
import {
  model as User,
} from '../models/user';
import nconf from 'nconf';
import url from 'url';

const COMMUNITY_MANAGER_EMAIL = nconf.get('EMAILS:COMMUNITY_MANAGER_EMAIL');

function getUserFields (userFieldsToExclude, req) {
  // A list of user fields that aren't needed for the route and are not loaded from the db.
  // Must be an array
  if (userFieldsToExclude) {
    return userFieldsToExclude.map(field => {
      return `-${field}`; // -${field} means exclude ${field} in mongodb
    }).join(' ');
  }

  // Allows GET requests to /user to specify a list of user fields to return instead of the entire doc
  // Notifications are always included
  const urlPath = url.parse(req.url).pathname;
  const userFields = req.query.userFields;
  if (!userFields || urlPath !== '/user') return '';

  const userFieldOptions = userFields.split(',');
  if (userFieldOptions.length === 0) return '';

  return `notifications ${userFieldOptions.join(' ')}`;
}

// Strins won't be translated here because getUserLanguage has not run yet

// Authenticate a request through the x-api-user and x-api key header
// If optional is true, don't error on missing authentication
export function authWithHeaders (optional = false, options = {}) {
  return function authWithHeadersHandler (req, res, next) {
    let userId = req.header('x-api-user');
    let apiToken = req.header('x-api-key');

    if (!userId || !apiToken) {
      if (optional) return next();
      return next(new NotAuthorized(res.t('missingAuthHeaders')));
    }

    const userQuery = {
      _id: userId,
      apiToken,
    };

    const fields = getUserFields(options.userFieldsToExclude, req);
    const findPromise = fields ? User.findOne(userQuery).select(fields) : User.findOne(userQuery);

    return findPromise
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
