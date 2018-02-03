// @TODO: Can we import only the functions we need instead of the large object?
import common from '../../../../common';
import { authWithHeaders } from '../../../middlewares/auth';

let api = {};

/**
 * @api {post} /api/v3/user/allocate Allocate a single attribute point
 * @apiName UserAllocate
 * @apiGroup User
 *
 * @apiParam (Body) {String="str","con","int","per"} stat Query parameter - Default ='str'
 *
 * @apiParamExample {json} Example request
 * {"stat":"int"}
 *
 * @apiSuccess {Object} data Returns stats from the user profile
 *
 * @apiError {NotAuthorized} NoPoints Not enough attribute points to increment a stat.
 *
 * @apiErrorExample {json}
 *  {
 *   "success": false,
 *   "error": "NotAuthorized",
 *   "message": "You don't have enough attribute points."
 * }
 */
api.allocate = {
  method: 'POST',
  middlewares: [authWithHeaders()],
  url: '/user/allocate',
  async handler (req, res) {
    let user = res.locals.user;
    let allocateRes = common.ops.allocate(user, req);
    await user.save();
    res.respond(200, ...allocateRes);
  },
};

/**
 * @api {post} /api/v3/user/allocate-bulk Allocate multiple attribute points
 * @apiName UserAllocateBulk
 * @apiGroup User
 *
 * @apiParam (Body) { Object } stats Body parameter
 *
 * @apiParamExample {json} Example request
 * {
 *  stats: {
 *    'int': int,
 *    'str': int,
 *    'con': int,
 *    'per': int,
 *  },
 * }
 *
 * @apiSuccess {Object} data Returns stats from the user profile
 *
 * @apiError {NotAuthorized} NoPoints Not enough attribute points to increment a stat.
 *
 * @apiErrorExample {json}
 *  {
 *   "success": false,
 *   "error": "NotAuthorized",
 *   "message": "You don't have enough attribute points."
 * }
 */
api.allocateBulk = {
  method: 'POST',
  middlewares: [authWithHeaders()],
  url: '/user/allocate-bulk',
  async handler (req, res) {
    let user = res.locals.user;
    let allocateRes = common.ops.allocateBulk(user, req);
    await user.save();
    res.respond(200, ...allocateRes);
  },
};

/**
 * @api {post} /api/v3/user/allocate-now Allocate all attribute points
 * @apiDescription Uses the user's chosen automatic allocation method, or if none, assigns all to STR. Note: will return success, even if there are 0 points to allocate.
 * @apiName UserAllocateNow
 * @apiGroup User
 *
 * @apiSuccessExample {json} Success-Response:
 *  {
 *   "success": true,
 *   "data": {
 *     "hp": 50,
 *     "mp": 38,
 *     "exp": 7,
 *     "gp": 284.8637271160258,
 *     "lvl": 10,
 *     "class": "rogue",
 *     "points": 0,
 *     "str": 2,
 *     "con": 2,
 *     "int": 3,
 *     "per": 3,
 *     "buffs": {
 *       "str": 0,
 *       "int": 0,
 *       "per": 0,
 *       "con": 0,
 *       "stealth": 0,
 *       "streaks": false,
 *       "snowball": false,
 *       "spookySparkles": false,
 *       "shinySeed": false,
 *       "seafoam": false
 *     },
 *     "training": {
 *       "int": 0,
 *       "per": 0,
 *       "str": 0,
 *       "con": 0
 *     }
 *   }
 * }
 *
 * @apiSuccess {Object} data user.stats
 */
api.allocateNow = {
  method: 'POST',
  middlewares: [authWithHeaders()],
  url: '/user/allocate-now',
  async handler (req, res) {
    let user = res.locals.user;
    let allocateNowRes = common.ops.allocateNow(user);
    await user.save();
    res.respond(200, ...allocateNowRes);
  },
};

module.exports = api;
