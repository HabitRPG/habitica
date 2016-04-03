let api = {};

/**
 * @api {get} /status Get Habitica's status
 * @apiVersion 3.0.0
 * @apiName GetStatus
 * @apiGroup Status
 *
 * @apiSuccess {status} string 'up' if everything is ok
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
