import {
  Forbidden,
} from '../libs/errors';

export function ensureAdmin (req, res, next) {
  let user = res.locals.user;

  if (!user.contributor.admin) {
    return next(new Forbidden(res.t('noAdminAccess')));
  }

  next();
}

export function ensureSudo (req, res, next) {
  let user = res.locals.user;

  if (!user.contributor.sudo) {
    return next(new Forbidden(res.t('noSudoAccess')));
  }

  next();
}
