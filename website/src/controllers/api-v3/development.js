import { authWithHeaders } from '../../middlewares/api-v3/auth';
import cron from '../../middlewares/api-v3/cron';
import checkForDevelopmentMode from '../../middlewares/api-v3/developmentMode';

let api = {};

api.development = {
  method: 'all',
  url: '/development/*',
  middlewares: [checkForDevelopmentMode, authWithHeaders(), cron],
};

/**
 * @api {post} /development/addTenGems Add ten gems to the current user
 * @apiVersion 3.0.0
 * @apiName AddTenGems
 * @apiGroup Development
 *
 * @apiSuccess {} An empty Object
 */
api.addTenGems = {
  method: 'POST',
  url: '/development/addTenGems',
  async handler (req, res) {
    let user = res.locals.user;

    user.balance += 2.5;

    await user.save();

    res.respond(200, {});
  },
};

/**
 * @api {post} /development/addHourglass Add Hourglass to the current user
 * @apiVersion 3.0.0
 * @apiName AddHourglass
 * @apiGroup Development
 *
 * @apiSuccess {} An empty Object
 */
api.addHourglass = {
  method: 'POST',
  url: '/development/addHourglass',
  async handler (req, res) {
    let user = res.locals.user;

    user.purchased.plan.consecutive.trinkets += 1;

    await user.save();

    res.respond(200, {});
  },
};

module.exports = api;
