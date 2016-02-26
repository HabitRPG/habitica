import {
  NotAuthorized,
  BadRequest,
} from '../../libs/api-v3/errors';
import i18n from '../../../../common/script/i18n';
import {
  model as User,
} from '../../models/user';

// Authenticate a request through the x-api-user and x-api key header
// If optional is true, don't error on missing authentication
export function authWithHeaders (optional = false) {
  return function authWithHeadersHandler (req, res, next) {
    let userId = req.header('x-api-user');
    let apiToken = req.header('x-api-key');

    if (!userId || !apiToken) {
      if (optional) return next();
      return next(new BadRequest(res.t('missingAuthHeaders')));
    }

    User.findOne({
      _id: userId,
      apiToken,
    })
    .exec()
    .then((user) => {
      if (!user) throw new NotAuthorized(i18n.t('invalidCredentials'));
      if (user.auth.blocked) throw new NotAuthorized(i18n.t('accountSuspended', {userId: user._id}));

      res.locals.user = user;
      // TODO use either session/cookie or headers, not both
      req.session.userId = user._id;
      next();
    })
    .catch(next);
  };
}

// Authenticate a request through a valid session
// TODO should use json web token
export function authWithSession (req, res, next) {
  let userId = req.session.userId;

  if (!userId) return next(new NotAuthorized(i18n.t('invalidCredentials')));

  User.findOne({
    _id: userId,
  })
  .exec()
  .then((user) => {
    if (!user) throw new NotAuthorized(i18n.t('invalidCredentials'));

    res.locals.user = user;
    next();
  })
  .catch(next);
}
