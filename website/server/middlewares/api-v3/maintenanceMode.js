import nconf from 'nconf';

const MAINTENANCE_MODE = nconf.get('MAINTENANCE_MODE');

module.exports = function maintenanceMode (req, res, next) {
  if (MAINTENANCE_MODE !== 'true') return next();

  if (req.headers && req.headers.accept && req.headers.accept.indexOf('text/html') !== -1) {
    return res.status(503).render('../../../views/static/maintenance');
  } else {
    return res.status(503).send('Server offline for maintenance.');
  }
};
