import { authWithHeaders } from '../../middlewares/api-v3/auth';
import cron from '../../middlewares/api-v3/cron';
import ensureDevelpmentMode from '../../middlewares/api-v3/ensureDevelpmentMode';

let api = {};

api.debug = {
  method: 'all',
  url: '/debug/*',
  middlewares: [ensureDevelpmentMode, authWithHeaders(), cron],
};

/**
 * @api {post} /debug/add-ten-gems Add ten gems to the current user
 * @apiVersion 3.0.0
 * @apiName AddTenGems
 * @apiGroup Development
 *
 * @apiSuccess {} An empty Object
 */
api.addTenGems = {
  method: 'POST',
  url: '/debug/add-ten-gems',
  async handler (req, res) {
    let user = res.locals.user;

    user.balance += 2.5;

    await user.save();

    res.respond(200, {});
  },
};

/**
 * @api {post} /debug/add-hourglass Add Hourglass to the current user
 * @apiVersion 3.0.0
 * @apiName AddHourglass
 * @apiGroup Development
 *
 * @apiSuccess {} An empty Object
 */
api.addHourglass = {
  method: 'POST',
  url: '/debug/add-hourglass',
  async handler (req, res) {
    let user = res.locals.user;

    user.purchased.plan.consecutive.trinkets += 1;

    await user.save();

    res.respond(200, {});
  },
};

module.exports = api;
