import { authWithHeaders } from '../../middlewares/auth';
import * as userLib from '../../libs/user';
import { verifyDisplayName } from '../../libs/user/validation';
import common from '../../../common';
import { TransactionModel as Transaction } from '../../models/transaction';

const api = {};

/*
* NOTE most user routes are still in the v3 controller
* here there are only routes that had to be split from the v3 version because of
* some breaking change (for example because their returned the entire user object).
*/

/* NOTE this route has also an API v3 version */

/**
 * @apiIgnore
 * @api {get} /api/v4/user Get the authenticated user's profile
 * @apiName UserGet
 * @apiGroup User
 *
 * @apiDescription The user profile contains data related to the authenticated user
 * including (but not limited to);
 * Achievements
 * Authentications (including types and timestamps)
 * Challenges
 * Flags (including armoire, tutorial, tour etc...)
 * Guilds
 * History (including timestamps and values)
 * Inbox (without messages in v4)
 * Invitations (to parties/guilds)
 * Items (character's full inventory)
 * New Messages (flags for groups/guilds that have new messages)
 * Notifications
 * Party (includes current quest information)
 * Preferences (user selected prefs)
 * Profile (name, photo url, blurb)
 * Purchased (includes purchase history, gem purchased items, plans)
 * PushDevices (identifiers for mobile devices authorized)
 * Stats (standard RPG stats, class, buffs, xp, etc..)
 * Tags
 * TasksOrder (list of all ids for dailys, habits, rewards and todos)
 *
 * @apiParam (Query) {String} [userFields] A list of comma separated user fields
 *                                         to be returned instead of the entire document.
 *                                         Notifications are always returned.
 *
 * @apiExample {curl} Example use:
 * curl -i https://habitica.com/api/v3/user?userFields=achievements,items.mounts
 *
 * @apiSuccess {Object} data The user object
 *
 * @apiSuccessExample {json} Result:
 *  {
 *   "success": true,
 *   "data": {
 *   --  User data included here, for details of the user model see:
 *   --  https://github.com/HabitRPG/habitica/tree/develop/website/server/models/user
 *   }
 * }
 *
*/
api.getUser = {
  method: 'GET',
  middlewares: [authWithHeaders()],
  url: '/user',
  async handler (req, res) {
    await userLib.get(req, res, { isV3: false });
  },
};

/* NOTE this route has also an API v3 version */

/**
 * @apiIgnore
 * @api {put} /api/v4/user Update the user
 * @apiName UserUpdate
 * @apiGroup User
 *
 * @apiDescription Some of the user items can be updated, such as preferences, flags and stats.
 ^
 * @apiParamExample {json} Request-Example:
 *  {
 *   "achievements.habitBirthdays": 2,
 *   "profile.name": "MadPink",
 *   "stats.hp": 53,
 *   "flags.warnedLowHealth":false,
 *   "preferences.allocationMode":"flat",
 *   "preferences.hair.bangs": 3
 * }
 *
 * @apiSuccess {Object} data The updated user object, the result is identical to the get user call
 *
 * @apiError (401) {NotAuthorized} messageUserOperationProtected Returned if the
 *                                                               change is not allowed.
 *
 * @apiErrorExample {json} Error-Response:
 *  {
 *   "success": false,
 *   "error": "NotAuthorized",
 *   "message": "path `stats.class` was not saved, as it's a protected path."
 * }
 */
api.updateUser = {
  method: 'PUT',
  middlewares: [authWithHeaders()],
  url: '/user',
  async handler (req, res) {
    await userLib.update(req, res, { isV3: false });
  },
};

/* NOTE this route has also an API v3 version */

/**
 * @apiIgnore
 * @api {post} /api/v4/user/rebirth Use Orb of Rebirth on user
 * @apiName UserRebirth
 * @apiGroup User
 *
 * @apiSuccess {Object} data.user
 * @apiSuccess {Array} data.tasks User's modified tasks (no rewards)
 * @apiSuccess {String} message Success message
 *
 * @apiSuccessExample {json}
 *  {
 *   "success": true,
 *   "data": {
 *   },
 *   "message": "You have been reborn!"
 *     {
 *       "type": "REBIRTH_ACHIEVEMENT",
 *       "data": {},
 *       "id": "424d69fa-3a6d-47db-96a4-6db42ed77a43"
 *     }
 *   ]
 * }
 *
 * @apiError {NotAuthorized} Not enough gems
 *
 * @apiErrorExample {json}
 * {"success":false,"error":"NotAuthorized","message":"Not enough Gems"}
 */
api.userRebirth = {
  method: 'POST',
  middlewares: [authWithHeaders()],
  url: '/user/rebirth',
  async handler (req, res) {
    await userLib.rebirth(req, res, { isV3: false });
  },
};

/* NOTE this route has also an API v3 version */

/**
 * @apiIgnore
 * @api {post} /api/v4/user/reroll Reroll a user using the Fortify Potion
 * @apiName UserReroll
 * @apiGroup User
 *
 * @apiSuccess {Object} data.user
 * @apiSuccess {Object} data.tasks User's modified tasks (no rewards)
 * @apiSuccess {Object} message Success message
 *
 * @apiSuccessExample {json}
 *  {
 *   "success": true,
 *   "data": {
 *   },
 *   "message": "Fortify complete!"
 * }
 *
 * @apiError {NotAuthorized} Not enough gems
 *
 * @apiErrorExample {json}
 * {"success":false,"error":"NotAuthorized","message":"Not enough Gems"}
 */
api.userReroll = {
  method: 'POST',
  middlewares: [authWithHeaders()],
  url: '/user/reroll',
  async handler (req, res) {
    await userLib.reroll(req, res, { isV3: false });
  },
};

/* NOTE this route has also an API v3 version */

/**
 * @apiIgnore
 * @api {post} /api/v4/user/reset Reset user
 * @apiName UserReset
 * @apiGroup User
 *
 * @apiSuccess {Object} data.user
 * @apiSuccess {Array} data.tasksToRemove IDs of removed tasks
 * @apiSuccess {String} message Success message
 *
 * @apiSuccessExample {json}
 *  {
 *   "success": true,
 *   "data": {--TRUNCATED--},
 *     "tasksToRemove": [
 *       "ebb8748c-0565-431e-9036-b908da25c6b4",
 *       "12a1cecf-68eb-40a7-b282-4f388c32124c"
 *     ]
 *   },
 *   "message": "Reset complete!"
 * }
 */
api.userReset = {
  method: 'POST',
  middlewares: [authWithHeaders()],
  url: '/user/reset',
  async handler (req, res) {
    await userLib.reset(req, res, { isV3: false });
  },
};

api.verifyDisplayName = {
  method: 'POST',
  url: '/user/auth/verify-display-name',
  middlewares: [authWithHeaders({
    optional: true,
  })],
  async handler (req, res) {
    req.checkBody({
      displayName: {
        notEmpty: { errorMessage: res.t('messageMissingDisplayName') },
      },
    });

    const validationErrors = req.validationErrors();
    if (validationErrors) throw validationErrors;

    const chosenDisplayName = req.body.displayName;

    const issues = verifyDisplayName(chosenDisplayName, res);

    if (issues.length > 0) {
      res.respond(200, { isUsable: false, issues });
    } else {
      res.respond(200, { isUsable: true });
    }
  },
};

/**
 * @api {post} /api/v4/user/unequip/:type Unequip all items by type
 * @apiName UserUnEquipByType
 * @apiGroup User
 *
 * @apiParam (Path) {String="pet-mount-background","costume","equipped"} type The type of items
 *                                                                       to unequip.
 *
 * @apiParamExample {URL} Example-URL
 * https://habitica.com/api/v4/user/unequip/equipped
 *
 * @apiSuccess {Object} data user.items
 * @apiSuccess {String} message Optional success message for unequipping an items
 *
 * @apiSuccessExample {json} Example return:
 *  {
 *   "success": true,
 *   "data": {---DATA TRUNCATED---},
 *   "message": "Battle Gear unequipped.
 * }
 *
 */
api.unequip = {
  method: 'POST',
  middlewares: [authWithHeaders()],
  url: '/user/unequip/:type',
  async handler (req, res) {
    const { user } = res.locals;
    const equipRes = common.ops.unEquipByType(user, req);
    await user.save();
    res.respond(200, ...equipRes);
  },
};

/**
 * @api {get} /api/v4/user/purchase-history Get users purchase history
 * @apiName UserGetPurchaseHistory
 * @apiGroup User
 *
 */
api.purchaseHistory = {
  method: 'GET',
  middlewares: [authWithHeaders()],
  url: '/user/purchase-history',
  async handler (req, res) {
    const { user } = res.locals;
    const transactions = await Transaction.find({ userId: user._id }).sort({ createdAt: -1 });
    res.respond(200, transactions);
  },
};

export default api;
