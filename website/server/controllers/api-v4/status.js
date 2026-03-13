import {
  disableCache,
} from '../../middlewares/cache';
import SERVER_STATUS from '../../libs/serverStatus';

const api = {};

/**
 * @api {get} /api/v3/ready Get Habitica's Server readiness status
 * @apiName GetReady
 * @apiGroup Status
 *
 * @apiSuccess {String} data.status 'ready' if everything is ok
 *
 * @apiSuccessExample {JSON} Server is Ready
 * {
 *   'status': 'ready',
 * }
 */
api.getReady = {
  method: 'GET',
  url: '/ready',
  // explicitly disable caching so that the server is always checked
  middlewares: [disableCache],
  async handler (req, res) {
    // This allows kubernetes to determine if the server is ready to receive traffic
    if (!SERVER_STATUS.MONGODB || !SERVER_STATUS.REDIS || !SERVER_STATUS.EXPRESS) {
      res.respond(503, {
        status: 'not ready',
      });
    } else {
      res.respond(200, {
        status: 'ready',
      });
    }
  },
};

export default api;
