import { authWithHeaders } from '../../middlewares/api-v3/auth';
import ensureDevelpmentMode from '../../middlewares/api-v3/ensureDevelpmentMode';

let api = {};

/**
 * @api {post} /api/v3/debug/add-ten-gems Add ten gems to the current user.
 * @apiDescription Only available in development mode.
 * @apiVersion 3.0.0
 * @apiName AddTenGems
 * @apiGroup Development
 *
 * @apiSuccess {Object} data An empty Object
 */
api.addTenGems = {
  method: 'POST',
  url: '/debug/add-ten-gems',
  middlewares: [ensureDevelpmentMode, authWithHeaders()],
  async handler (req, res) {
    let user = res.locals.user;

    user.balance += 2.5;

    await user.save();

    res.respond(200, {});
  },
};

/**
 * @api {post} /api/v3/debug/add-hourglass Add Hourglass to the current user.
 * @apiDescription Only available in development mode.
 * @apiVersion 3.0.0
 * @apiName AddHourglass
 * @apiGroup Development
 *
 * @apiSuccess {Object} data An empty Object
 */
api.addHourglass = {
  method: 'POST',
  url: '/debug/add-hourglass',
  middlewares: [ensureDevelpmentMode, authWithHeaders()],
  async handler (req, res) {
    let user = res.locals.user;

    user.purchased.plan.consecutive.trinkets += 1;

    await user.save();

    res.respond(200, {});
  },
};

/**
 * @api {post} /api/v3/debug/set-cron Sets lastCron for user
 * @apiDescription Only available in development mode.
 * @apiVersion 3.0.0
 * @apiName setCron
 * @apiGroup Development
 *
 * @apiSuccess {Object} data An empty Object
 */
api.setCron = {
  method: 'POST',
  url: '/debug/set-cron',
  middlewares: [ensureDevelpmentMode, authWithHeaders()],
  async handler (req, res) {
    let user = res.locals.user;
    let cron = req.body.lastCron;

    user.lastCron = cron;

    await user.save();

    res.respond(200, {});
  },
};

/**
 * @api {post} /api/v3/debug/make-admin Sets contributor.admin to true
 * @apiDescription Only available in development mode.
 * @apiVersion 3.0.0
 * @apiName setCron
 * @apiGroup Development
 *
 * @apiSuccess {Object} data An empty Object
 */
api.makeAdmin = {
  method: 'POST',
  url: '/debug/make-admin',
  middlewares: [ensureDevelpmentMode, authWithHeaders()],
  async handler (req, res) {
    let user = res.locals.user;

    user.contributor.admin = true;

    await user.save();

    res.respond(200, {});
  },
};

module.exports = api;
