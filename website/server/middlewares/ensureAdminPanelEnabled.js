import nconf from 'nconf';
import {
  NotFound,
} from '../libs/errors';

export function isAdminPanelEnabled () {
  return String(nconf.get('ENABLE_ADMIN_PANEL')) === 'true';
}

export function ensureAdminPanelEnabled (req, res, next) {
  if (isAdminPanelEnabled()) {
    next();
  } else {
    next(new NotFound());
  }
}
