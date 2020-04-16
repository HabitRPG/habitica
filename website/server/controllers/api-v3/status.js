import {
  disableCache,
} from '../../middlewares/cache';

const api = {};

/**
 * @api {get} /api/v3/status Get Habitica's API status
 * @apiName GetStatus
 * @apiGroup Status
 *
 * @apiSuccess {String} data.status 'up' if everything is ok
 *
 * @apiSuccessExample {JSON} Server is Up
 * {
 *   'status': 'up',
 * }
 */
api.getStatus = {
  method: 'GET',
  url: '/status',
  // explicitly disable caching so that the server is always checked
  middlewares: [disableCache],
  async handler (req, res) {
    res.respond(200, {
      status: 'up',
    });
  },
};

export default api;
