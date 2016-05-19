import { getUserLanguage, } from './language';
import nconf from 'nconf';

const MAINTENANCE_MODE = nconf.get('MAINTENANCE_MODE');

module.exports = function maintenanceMode (req, res, next) {
  if (MAINTENANCE_MODE !== 'true') return next();

  getUserLanguage(req, res, function (err) {
    if (err) return next(err);

    const MAINTENANCE_END = nconf.get('MAINTENANCE_END');

    if (req.headers && req.headers.accept && req.headers.accept.indexOf('text/html') !== -1) {
      return res.status(503).render('../../../views/static/maintenance', {
        env: res.locals.habitrpg,
        t: res.t,
        maintenanceEnd: new Date(MAINTENANCE_END),
      });
    } else {
      return res.status(503).send({
        error: 'Maintenance', 
        message: 'Server offline for maintenance.',
      });
    }
  });
};
