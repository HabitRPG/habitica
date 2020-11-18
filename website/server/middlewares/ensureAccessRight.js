import {
  NotAuthorized,
} from '../libs/errors';
import apiError from '../libs/apiError';

export function ensureAdmin (req, res, next) { // @TODO replace with ensurePriv
  const { user } = res.locals;

  if (!user.contributor.admin) {
    return next(new NotAuthorized(res.t('noAdminAccess')));
  }

  return next();
}

export function ensureNewsPoster (req, res, next) { // @TODO replace with ensurePriv
  const { user } = res.locals;

  if (!user.contributor.newsPoster) {
    return next(new NotAuthorized(apiError('noNewsPosterAccess')));
  }

  return next();
}

export function ensureSudo (req, res, next) { // @TODO replace with ensurePriv
  const { user } = res.locals;

  if (!user.contributor.sudo) {
    return next(new NotAuthorized(apiError('noSudoAccess')));
  }

  return next();
}

export function ensurePriv (priv) {
  return function ensurePrivHandler (req, res, next) {
    const { user } = res.locals;

    if (!user.contributor.priv[priv]) {
      return next(new NotAuthorized(apiError('noPrivAccess')));
    }

    return next();
  };
}
