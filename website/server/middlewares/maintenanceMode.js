import { getUserLanguage } from './language';
import nconf from 'nconf';

const MAINTENANCE_MODE = nconf.get('MAINTENANCE_MODE');

module.exports = function maintenanceMode (req, res, next) {
  if (MAINTENANCE_MODE !== 'true') return next();

  getUserLanguage(req, res, (err) => {
    if (err) return next(err);

    let pageVariables = {
      maintenanceStart: nconf.get('MAINTENANCE_START'),
      maintenanceEnd: nconf.get('MAINTENANCE_END'),
      translation: res.t,
    };

    if (req.headers && req.headers.accept && req.headers.accept.indexOf('text/html') !== -1) {
      if (req.path === '/views/static/maintenance-info') {
        return res.status(503).render('../../views/static/maintenance-info', pageVariables);
      } else {
        return res.status(503).render('../../views/static/maintenance', pageVariables);
      }
    } else {
      return res.status(503).send({
        error: 'Maintenance',
        message: 'Server offline for maintenance.',
      });
    }
  });
};
