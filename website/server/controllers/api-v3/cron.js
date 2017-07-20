import { authWithHeaders } from '../../middlewares/auth';
import cron from '../../middlewares/cron';

let api = {};

/**
 * @api {post} /api/v3/cron Runs cron
 * @apiName Cron
 * @apiGroup Cron
 *
 * @apiSuccess {Object} data An empty Object
 */
api.cron = {
  method: 'POST',
  url: '/cron',
  middlewares: [authWithHeaders(), cron],
  async handler (req, res) {
    res.respond(200, {});
  },
};

module.exports = api;
