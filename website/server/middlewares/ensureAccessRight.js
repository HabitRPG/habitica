import {
  NotAuthorized,
} from '../libs/errors';
import apiError from '../libs/apiError';

export function ensureAdmin (req, res, next) {
  const { user } = res.locals;

  if (!user.contributor.admin) {
    return next(new NotAuthorized(res.t('noAdminAccess')));
  }

  return next();
}

export function ensureSudo (req, res, next) {
  const { user } = res.locals;

  if (!user.contributor.sudo) {
    return next(new NotAuthorized(apiError('noSudoAccess')));
  }

  return next();
}
