import {
  NotAuthorized,
} from '../libs/errors';
import apiMessages from '../libs/apiMessages';

export function ensureAdmin (req, res, next) {
  let user = res.locals.user;

  if (!user.contributor.admin) {
    return next(new NotAuthorized(res.t('noAdminAccess')));
  }

  next();
}

export function ensureSudo (req, res, next) {
  let user = res.locals.user;

  if (!user.contributor.sudo) {
    return next(new NotAuthorized(apiMessages('noSudoAccess')));
  }

  next();
}
