import {
  NotAuthorized,
} from '../libs/errors';
import {
  model as User,
} from '../models/user';
import nconf from 'nconf';
import url from 'url';
import gcpStackdriverTracer from '../libs/gcpTraceAgent';

const COMMUNITY_MANAGER_EMAIL = nconf.get('EMAILS_COMMUNITY_MANAGER_EMAIL');
const USER_FIELDS_ALWAYS_LOADED = ['_id', 'notifications', 'preferences', 'auth', 'flags'];

function getUserFields (options, req) {
  // A list of user fields that aren't needed for the route and are not loaded from the db.
  // Must be an array
  if (options.userFieldsToExclude) {
    return options.userFieldsToExclude
      .filter(field => {
        return !USER_FIELDS_ALWAYS_LOADED.find(fieldToInclude => field.startsWith(fieldToInclude));
      })
      .map(field => {
        return `-${field}`; // -${field} means exclude ${field} in mongodb
      })
      .join(' ');
  }

  if (options.userFieldsToInclude) {
    return options.userFieldsToInclude.concat(USER_FIELDS_ALWAYS_LOADED).join(' ');
  }

  // Allows GET requests to /user to specify a list of user fields to return instead of the entire doc
  const urlPath = url.parse(req.url).pathname;
  const userFields = req.query.userFields;
  if (!userFields || urlPath !== '/user') return '';

  const userFieldOptions = userFields.split(',');
  if (userFieldOptions.length === 0) return '';

  return userFieldOptions.concat(USER_FIELDS_ALWAYS_LOADED).join(' ');
}

// Make sure stackdriver traces are storing the user id
function stackdriverTraceUserId (userId) {
  if (gcpStackdriverTracer) {
    gcpStackdriverTracer.getCurrentRootSpan().addLabel('userId', userId);
  }
}

// Strins won't be translated here because getUserLanguage has not run yet

// Authenticate a request through the x-api-user and x-api key header
// If optional is true, don't error on missing authentication
export function authWithHeaders (options = {}) {
  return function authWithHeadersHandler (req, res, next) {
    const userId = req.header('x-api-user');
    const apiToken = req.header('x-api-key');
    const optional = options.optional || false;

    if (!userId || !apiToken) {
      if (optional) return next();
      return next(new NotAuthorized(res.t('missingAuthHeaders')));
    }

    const userQuery = {
      _id: userId,
      apiToken,
    };

    const fields = getUserFields(options, req);
    const findPromise = fields ? User.findOne(userQuery).select(fields) : User.findOne(userQuery);

    return findPromise
      .exec()
      .then((user) => {
        if (!user) throw new NotAuthorized(res.t('invalidCredentials'));
        if (user.auth.blocked) throw new NotAuthorized(res.t('accountSuspended', {communityManagerEmail: COMMUNITY_MANAGER_EMAIL, userId: user._id}));

        res.locals.user = user;
        req.session.userId = user._id;
        stackdriverTraceUserId(user._id);

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
      stackdriverTraceUserId(user._id);
      return next();
    })
    .catch(next);
}
