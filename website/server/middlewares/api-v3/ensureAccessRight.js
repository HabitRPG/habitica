import {
  NotAuthorized,
} from '../../libs/api-v3/errors';

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
    return next(new NotAuthorized(res.t('noSudoAccess')));
  }

  next();
}
