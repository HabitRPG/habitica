import { authWithHeaders } from '../../middlewares/auth';
import cron from '../../middlewares/cron';

const api = {};

/**
 * @api {post} /api/v3/cron Run cron
 * @apiName Cron
 * @apiDescription This causes cron to run. It assumes that the user has already been shown
 * the Record Yesterday's Activity ("Check off any Dailies you did yesterday") screen and
 * so it will immediately apply damage for incomplete due Dailies.
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

export default api;
