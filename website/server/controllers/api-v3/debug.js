import { authWithHeaders } from '../../middlewares/api-v3/auth';
import ensureDevelpmentMode from '../../middlewares/api-v3/ensureDevelpmentMode';
// import _ from 'lodash';

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
 * @api {post} /api/v3/debug/set-property Sets properties on user, even protected fields
 * @apiDescription Only available in development mode.
 * @apiVersion 3.0.0
 * @apiName setCron
 * @apiGroup Development
 *
 * @apiSuccess {Object} data An empty Object
 */
// api.setCron = {
//   method: 'POST',
//   url: '/debug/update-user',
//   middlewares: [ensureDevelpmentMode, authWithHeaders()],
//   async handler (req, res) {
//     let user = res.locals.user;
//
//     _.each(req.body, (value, key) => {
//       _.set(user, key, value);
//     });
//
//     await user.save();
//
//     res.respond(200, {});
//   },
// };

module.exports = api;
