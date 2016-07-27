let api = {};

/**
 * @api {get} /api/v3/status Get Habitica's API status
 * @apiVersion 3.0.0
 * @apiName GetStatus
 * @apiGroup Status
 *
 * @apiSuccess {Status} data.status 'up' if everything is ok
 */
api.getStatus = {
  method: 'GET',
  url: '/status',
  async handler (req, res) {
    res.respond(200, {
      status: 'up',
    });
  },
};

module.exports = api;
