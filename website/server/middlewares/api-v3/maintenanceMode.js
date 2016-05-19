import { getUserLanguage } from './language';
import nconf from 'nconf';

const MAINTENANCE_MODE = nconf.get('MAINTENANCE_MODE');

module.exports = function maintenanceMode (req, res, next) {
  if (MAINTENANCE_MODE !== 'true') return next();

  getUserLanguage(req, res, function maintenanceMiddleware (err) {
    if (err) return next(err);

    const MAINTENANCE_START = nconf.get('MAINTENANCE_START');
    const MAINTENANCE_END = nconf.get('MAINTENANCE_END');

    if (req.headers && req.headers.accept && req.headers.accept.indexOf('text/html') !== -1) {
      if (req.path === '/views/static/maintenance-info') {
        return res.status(503).render('../../../views/static/maintenance-info', {
          env: res.locals.habitrpg,
          t: res.t,
          maintenanceStart: new Date(MAINTENANCE_START),
          maintenanceEnd: new Date(MAINTENANCE_END),
        });
      } else {
        return res.status(503).render('../../../views/static/maintenance', {
          env: res.locals.habitrpg,
          t: res.t,
          maintenanceEnd: new Date(MAINTENANCE_END),
        });
      }
    } else {
      return res.status(503).send({
        error: 'Maintenance',
        message: 'Server offline for maintenance.',
      });
    }
  });
};
