import {
  NotAuthorized,
} from '../libs/errors';
import apiError from '../libs/apiError';

export function ensurePermission (permission) {
  return function ensurePermissionHandler (req, res, next) {
    const { user } = res.locals;

    if (user.permissions.fullAccess) {
      // No matter what is checked, fullAccess admins can do it
      return next();
    }

    if (!user.permissions[permission]) {
      return next(new NotAuthorized(apiError('noPrivAccess')));
    }

    return next();
  };
}
