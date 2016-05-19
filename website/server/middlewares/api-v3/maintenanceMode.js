import moment from 'moment';
import nconf from 'nconf';

const MAINTENANCE_MODE = nconf.get('MAINTENANCE_MODE');

module.exports = function maintenanceMode (req, res, next) {
  if (MAINTENANCE_MODE !== 'true') return next();

  const MAINTENANCE_END = new Date('Sat May 21 2016 12:45 UTC');

  if (req.headers && req.headers.accept && req.headers.accept.indexOf('text/html') !== -1) {
    return res.status(503).render('../../../views/static/maintenance', {
      env: res.locals.habitrpg,
      t: res.t,
      maintenanceEndDate: MAINTENANCE_END.toLocaleDateString(),
      maintenanceEndTime: MAINTENANCE_END.toLocaleTimeString(),
    });
  } else {
    return res.status(503).send({
      error: 'Maintenance', 
      message: 'Server offline for maintenance.',
    });
  }
};
