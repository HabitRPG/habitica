import {
  NotAuthorized,
} from '../../libs/api-v3/errors';
import {
  model as User,
} from '../../models/user';

// TODO how to translate the strings here since getUserLanguage hasn't run yet?

// Authenticate a request through the x-api-user and x-api key header
// If optional is true, don't error on missing authentication
export function authWithHeaders (optional = false) {
  return function authWithHeadersHandler (req, res, next) {
    let userId = req.header('x-api-user');
    let apiToken = req.header('x-api-key');

    if (!userId || !apiToken) {
      if (optional) return next();
      return next(new NotAuthorized(res.t('missingAuthHeaders')));
    }

    User.findOne({
      _id: userId,
      apiToken,
    })
    .exec()
    .then((user) => {
      if (!user) throw new NotAuthorized(res.t('invalidCredentials'));
      if (user.auth.blocked) throw new NotAuthorized(res.t('accountSuspended', {userId: user._id}));

      res.locals.user = user;
      // TODO use either session/cookie or headers, not both
      req.session.userId = user._id;
      next();
    })
    .catch(next);
  };
}

// Authenticate a request through a valid session
export function authWithSession (req, res, next) {
  let userId = req.session.userId;

  if (!userId) return next(new NotAuthorized(res.t('invalidCredentials')));

  User.findOne({
    _id: userId,
  })
  .exec()
  .then((user) => {
    if (!user) throw new NotAuthorized(res.t('invalidCredentials'));

    res.locals.user = user;
    next();
  })
  .catch(next);
}

/**
 * @apiParam {string} _id       The user _id in query
 * @apiParam {string} apiToken  The apiToken in query
 **/
export function authWithUrl (req, res, next) {
  let userId = req.query._id;
  let apiToken = req.query.apiToken;

  if (!userId || !apiToken) {
    throw new NotAuthorized(res.t('missingAuthParams'));
  }

  User.findOne({ _id: req.query._id, apiToken }).exec()
  .then((user) => {
    if (!user) throw new NotAuthorized(res.t('invalidCredentials'));

    res.locals.user = user;
    next();
  })
  .catch(next);
}
