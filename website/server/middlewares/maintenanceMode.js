import nconf from 'nconf';
import { getUserLanguage } from './language';

const MAINTENANCE_MODE = nconf.get('MAINTENANCE_MODE');

export default function maintenanceMode (req, res, next) {
  if (MAINTENANCE_MODE !== 'true') return next();

  return getUserLanguage(req, res, err => {
    if (err) return next(err);

    const pageVariables = {
      maintenanceStart: nconf.get('MAINTENANCE_START'),
      maintenanceEnd: nconf.get('MAINTENANCE_END'),
      translation: res.t,
    };

    if (req.headers && req.headers.accept && req.headers.accept.indexOf('text/html') !== -1) {
      if (req.path === '/views/static/maintenance-info') {
        return res.status(503).render('../../views/static/maintenance-info', pageVariables);
      }
      return res.status(503).render('../../views/static/maintenance', pageVariables);
    }
    return res.status(503).send({
      error: 'Maintenance',
      message: 'Server offline for maintenance.',
    });
  });
}
