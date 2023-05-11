import _ from 'lodash';
import nconf from 'nconf';
import get from 'lodash/get';
import { authWithHeaders } from '../../middlewares/auth';
import common from '../../../common';
import {
  BadRequest,
  NotAuthorized,
} from '../../libs/errors';
import {
  basicFields as basicGroupFields,
  model as Group,
} from '../../models/group';
import * as Tasks from '../../models/task';
import * as passwordUtils from '../../libs/password';
import {
  userActivityWebhook,
} from '../../libs/webhook';
import {
  getUserInfo,
  sendTxn,
} from '../../libs/email';
import * as inboxLib from '../../libs/inbox';
import * as userLib from '../../libs/user';

const OFFICIAL_PLATFORMS = ['habitica-web', 'habitica-ios', 'habitica-android'];
const TECH_ASSISTANCE_EMAIL = nconf.get('EMAILS_TECH_ASSISTANCE_EMAIL');
const DELETE_CONFIRMATION = 'DELETE';

/**
 * @apiDefine UserNotFound
 * @apiError (404) {NotFound} UserNotFound The specified user could not be found.
 */

const api = {};

/* NOTE this route has also an API v4 version */

/**
 * @api {get} /api/v3/user Get the authenticated user's profile
 * @apiName UserGet
 * @apiGroup User
 *
 * @apiDescription The user profile contains data related to the authenticated
 * user including (but not limited to):
 * Achievements;
 * Authentications (including types and timestamps);
 * Challenges memberships (Challenge IDs);
 * Flags (including armoire, tutorial, tour etc...);
 * Guilds memberships (Guild IDs);
 * History (including timestamps and values, only for Experience and summed To Do values);
 * Inbox;
 * Invitations (to parties/guilds);
 * Items (character's full inventory);
 * New Messages (flags for party/guilds that have new messages; also reported in Notifications);
 * Notifications;
 * Party (includes current quest information);
 * Preferences (user selected prefs);
 * Profile (name, photo url, blurb);
 * Purchased (includes subscription data and some gem-purchased items);
 * PushDevices (identifiers for mobile devices authorized);
 * Stats (standard RPG stats, class, buffs, xp, etc..);
 * Tags;
 * TasksOrder (list of all IDs for Dailys, Habits, Rewards and To Do's).
 *
 * @apiParam (Query) {String} [userFields] A list of comma-separated user fields to
 *                                         be returned instead of the entire document.
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
    await userLib.get(req, res, { isV3: true });
  },
};

/**
 * @api {get} /api/v3/user/inventory/buy
 * Get equipment/gear items available for purchase for the authenticated user
 * @apiName UserGetBuyList
 * @apiGroup User
 *
 * @apiSuccessExample {json} Success-Response:
 * {
 *   "success": true,
 *   "data": [
 *     {
 *       "text": "Training Sword",
 *       "notes": "Practice weapon. Confers no benefit.",
 *       "value": 1,
 *       "type": "weapon",
 *       "key": "weapon_warrior_0",
 *       "set": "warrior-0",
 *       "klass": "warrior",
 *       "index": "0",
 *       "str": 0,
 *       "int": 0,
 *       "per": 0,
 *       "con": 0
 *     }
 *   ]
 * }
 */
api.getBuyList = {
  method: 'GET',
  middlewares: [authWithHeaders()],
  url: '/user/inventory/buy',
  async handler (req, res) {
    const list = _.cloneDeep(common.updateStore(res.locals.user));

    // return text and notes strings
    _.each(list, item => {
      _.each(item, (itemPropVal, itemPropKey) => {
        if (
          _.isFunction(itemPropVal)
          && itemPropVal.i18nLangFunc
        ) item[itemPropKey] = itemPropVal(req.language);
      });
    });

    res.respond(200, list);
  },
};

/**
 * @api {get} /api/v3/user/in-app-rewards Get the in app items appearing in the user's reward column
 * @apiName UserGetInAppRewards
 * @apiGroup User
 *
 * @apiSuccessExample {json} Success-Response:
 * {
 *   "success": true,
 *   "data": [
 *     {
 *       "key":"weapon_armoire_battleAxe",
 *       "text":"Battle Axe",
 *       "notes":"This fine iron axe is well-suited to battling your fiercest
 *               foes or your most difficult tasks. Increases Intelligence by 6 and
 *               Constitution by 8. Enchanted Armoire: Independent Item.",
 *       "value":1,
 *       "type":"weapon",
 *       "locked":false,
 *       "currency":"gems",
 *       "purchaseType":"gear",
 *       "class":"shop_weapon_armoire_battleAxe",
 *       "path":"gear.flat.weapon_armoire_battleAxe",
 *       "pinType":"gear"
 *     }
 *   ]
 * }
 */
api.getInAppRewardsList = {
  method: 'GET',
  middlewares: [authWithHeaders()],
  url: '/user/in-app-rewards',
  async handler (req, res) {
    const list = common.inAppRewards(res.locals.user);

    // return text and notes strings
    _.each(list, item => {
      _.each(item, (itemPropVal, itemPropKey) => {
        if (
          _.isFunction(itemPropVal)
          && itemPropVal.i18nLangFunc
        ) item[itemPropKey] = itemPropVal(req.language);
      });
    });

    res.respond(200, list);
  },
};

/* NOTE this route has also an API v4 version */

/**
 * @api {put} /api/v3/user Update the user
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
 * @apiError (401) {NotAuthorized} messageUserOperationProtected Returned if the change
 *                                                               is not allowed.
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
    await userLib.update(req, res, { isV3: true });
  },
};

/**
 * @api {delete} /api/v3/user Delete an authenticated user's account
 * @apiName UserDelete
 * @apiGroup User
 *
 * @apiParam (Body) {String} password The user's password if the account uses local authentication,
 * otherwise the localized word "DELETE"
 * @apiParam (Body) {String} feedback User's optional feedback explaining reasons for deletion
 *
 * @apiSuccess {Object} data An empty Object
 *
 * @apiSuccessExample {json} Result:
 *  {
 *   "success": true,
 *   "data": {}
 * }
 *
 * @apiError {BadRequest} MissingPassword Missing password.
 * @apiError {BadRequest} NotAuthorized Wrong password.
 * @apiError {BadRequest} NotAuthorized Please type DELETE in all capital letters to
 * delete your account.
 * @apiError {BadRequest} BadRequest Account deletion feedback is limited to 10,000 characters.
 * For lengthy feedback, email ${TECH_ASSISTANCE_EMAIL}.
 * @apiError {BadRequest} NotAuthorized You have an active subscription,
 * cancel your plan before deleting your account.
 *
 * @apiErrorExample {json} Example error:
 *  {
 *   "success": false,
 *   "error": "BadRequest",
 *   "message": "Invalid request parameters.",
 *   "errors": [
 *     {
 *       "message": "Missing password.",
 *       "param": "password"
 *     }
 *   ]
 * }
 *
 */
api.deleteUser = {
  method: 'DELETE',
  middlewares: [authWithHeaders()],
  url: '/user',
  async handler (req, res) {
    const { user } = res.locals;
    const { plan } = user.purchased;

    const { password } = req.body;
    if (!password) throw new BadRequest(res.t('missingPassword'));

    if (user.auth.local.hashed_password && user.auth.local.email) {
      const isValidPassword = await passwordUtils.compare(user, password);
      if (!isValidPassword) throw new NotAuthorized(res.t('wrongPassword'));
    } else if (
      (user.auth.facebook.id || user.auth.google.id || user.auth.apple.id)
      && password !== DELETE_CONFIRMATION
    ) {
      throw new NotAuthorized(res.t('incorrectDeletePhrase', { magicWord: 'DELETE' }));
    }

    const { feedback } = req.body;
    if (feedback && feedback.length > 10000) throw new BadRequest(`Account deletion feedback is limited to 10,000 characters. For lengthy feedback, email ${TECH_ASSISTANCE_EMAIL}.`); // @TODO localize this string

    if (plan && plan.customerId && !plan.dateTerminated) {
      throw new NotAuthorized(res.t('cannotDeleteActiveAccount'));
    }

    const types = ['party', 'guilds'];
    const groupFields = basicGroupFields.concat(' leader memberCount purchased');

    const groupsUserIsMemberOf = await Group.getGroups({ user, types, groupFields });

    const groupLeavePromises = groupsUserIsMemberOf.map(group => group.leave(user, 'remove-all'));

    await Promise.all(groupLeavePromises);

    await Tasks.Task.remove({
      userId: user._id,
    }).exec();

    await user.remove();

    if (feedback) {
      sendTxn({ email: TECH_ASSISTANCE_EMAIL }, 'admin-feedback', [
        { name: 'PROFILE_NAME', content: user.profile.name },
        { name: 'USERNAME', content: user.auth.local.username },
        { name: 'UUID', content: user._id },
        { name: 'EMAIL', content: getUserInfo(user, ['email']).email },
        { name: 'FEEDBACK_SOURCE', content: 'from deletion form' },
        { name: 'FEEDBACK', content: feedback },
      ]);
    }

    res.analytics.track('account delete', {
      uuid: user._id,
      hitType: 'event',
      category: 'behavior',
    });

    res.respond(200, {});
  },
};

function _cleanChecklist (task) {
  _.forEach(task.checklist, (c, i) => {
    c.text = `item ${i}`;
  });
}

/**
 * @api {get} /api/v3/user/anonymized Get anonymized user data
 * @apiName UserGetAnonymized
 * @apiGroup User
 *
 * @apiDescription Returns the user's data without:
 * Authentication information,
 * NewMessages/Invitations/Inbox,
 * Profile,
 * Purchased information,
 * Contributor information,
 * Special items,
 * Webhooks,
 * Notifications.
 *
 * @apiSuccess {Object} data.user
 * @apiSuccess {Object} data.tasks
 * */
api.getUserAnonymized = {
  method: 'GET',
  middlewares: [authWithHeaders()],
  url: '/user/anonymized',
  async handler (req, res) {
    const user = await res.locals.user.toJSONWithInbox();
    user.stats.toNextLevel = common.tnl(user.stats.lvl);
    user.stats.maxHealth = common.maxHealth;
    user.stats.maxMP = common.statsComputed(res.locals.user).maxMP;

    delete user.apiToken;
    if (user.auth) {
      delete user.auth.local;
      delete user.auth.facebook;
      delete user.auth.google;
      delete user.auth.apple;
    }
    delete user.newMessages;
    delete user.profile;
    delete user.purchased.plan;
    delete user.contributor;
    delete user.invitations;
    delete user.items.special.nyeReceived;
    delete user.items.special.valentineReceived;
    delete user.webhooks;
    delete user.achievements.challenges;
    delete user.notifications;
    delete user.secret;
    delete user.permissions;

    _.forEach(user.inbox.messages, msg => {
      msg.text = 'inbox message text';
    });

    _.forEach(user.tags, tag => {
      tag.name = 'tag';
      tag.challenge = 'challenge';
    });

    const query = {
      userId: user._id,
      $or: [
        { type: 'todo', completed: false },
        { type: { $in: ['habit', 'daily', 'reward'] } },
      ],
    };
    const tasks = await Tasks.Task.find(query).exec();

    _.forEach(tasks, task => {
      task.text = 'task text';
      task.notes = 'task notes';
      if (task.type === 'todo' || task.type === 'daily') {
        _cleanChecklist(task);
      }
    });

    return res.respond(200, { user, tasks });
  },
};

/**
 * @api {post} /api/v3/user/sleep Make the user start / stop sleeping (resting in the Inn)
 * @apiName UserSleep
 * @apiGroup User
 *
 * @apiDescription Toggles the sleep key under user preference true and false.
 *
 * @apiSuccess {boolean} data user.preferences.sleep
 *
 * @apiSuccessExample {json} Return-example
 * {
 *   "success": true,
 *   "data": false
 * }
 */
api.sleep = {
  method: 'POST',
  middlewares: [authWithHeaders()],
  url: '/user/sleep',
  async handler (req, res) {
    const { user } = res.locals;
    const sleepRes = common.ops.sleep(user, req, res.analytics);
    await user.save();
    res.respond(200, ...sleepRes);
  },
};

const buySpecialKeys = ['snowball', 'spookySparkles', 'shinySeed', 'seafoam'];
const buyKnownKeys = ['armoire', 'mystery', 'potion', 'quest', 'special'];

/**
 * @api {post} /api/v3/user/buy/:key Buy gear, armoire or potion
 * @apiDescription Under the hood uses UserBuyGear, UserBuyPotion and UserBuyArmoire
 * @apiName UserBuy
 * @apiGroup User
 *
 * @apiParam (Path) {String} key The item to buy
 *
 * @apiSuccess data User's data profile
 * @apiSuccess message Item purchased
 *
 * @apiSuccessExample {json} Purchased a rogue short sword for example:
 * {
 *   "success": true,
 *   "data": {
 *     ---TRUNCATED USER RECORD---
 *   },
 *   "message": "Bought Short Sword"
 * }
 *
 *  @apiError (400) {NotAuthorized} messageAlreadyOwnGear Already own equipment
 *  @apiError (400) {NotAuthorized} messageNotEnoughGold Not enough gold for the purchase
 *
 *  @apiErrorExample {json} NotAuthorized Already own
 *  {"success":false,"error":"NotAuthorized","message":"You already own that piece of equipment"}
 *
 *  @apiErrorExample {json} NotAuthorized Not enough gold
 *  {"success":false,"error":"NotAuthorized","message":"Not Enough Gold"}
 */
api.buy = {
  method: 'POST',
  middlewares: [authWithHeaders()],
  url: '/user/buy/:key',
  async handler (req, res) {
    const { user } = res.locals;

    // @TODO: Remove this when mobile passes type in body
    const type = req.params.key;
    if (buySpecialKeys.indexOf(type) !== -1) {
      req.type = 'special';
    } else if (buyKnownKeys.indexOf(type) === -1) {
      req.type = 'marketGear';
    }

    // @TODO: right now common follow express structure, but we should decouple the dependency
    if (req.body.type) req.type = req.body.type;

    let quantity = 1;
    if (req.body.quantity) quantity = req.body.quantity;
    req.quantity = quantity;
    if (OFFICIAL_PLATFORMS.indexOf(req.headers['x-client']) === -1) {
      res.analytics = undefined;
    }
    const buyRes = await common.ops.buy(user, req, res.analytics);

    await user.save();
    res.respond(200, ...buyRes);
  },
};

/**
 * @api {post} /api/v3/user/buy-gear/:key Buy a piece of gear
 * @apiName UserBuyGear
 * @apiGroup User
 *
 * @apiParam (Path) {String} key The item to buy
 *
 * @apiSuccess {Object} data.items User's item inventory
 * @apiSuccess {Object} data.flags User's flags
 * @apiSuccess {Object} data.achievements User's achievements
 * @apiSuccess {Object} data.stats User's current stats
 * @apiSuccess {String} message Success message, item purchased
 *
 * @apiSuccessExample {json} Purchased a warrior's wooden shield for example:
 * {
 *   "success": true,
 *   "data": {
 *     ---TRUNCATED USER RECORD---
 *   },
 *   "message": "Bought Wooden Shield"
 * }
 *
 *  @apiError (400) {NotAuthorized} messageNotEnoughGold Not enough gold for the purchase
 *  @apiError (400) {NotAuthorized} messageAlreadyOwnGear Already own equipment
 *  @apiError (404) {NotFound} messageNotFound Item does not exist.
 *
 *  @apiErrorExample {json} NotAuthorized Already own
 *  {"success":false,"error":"NotAuthorized","message":"You already own that piece of equipment"}
 *
 *  @apiErrorExample {json} NotAuthorized Not enough gold
 *  {"success":false,"error":"NotAuthorized","message":"Not Enough Gold"}
 *
 *  @apiErrorExample {json} NotFound Item not found
 * {"success":false,"error":"NotFound","message":"Item \"weapon_misspelled_1\" not found."}
 */
api.buyGear = {
  method: 'POST',
  middlewares: [authWithHeaders()],
  url: '/user/buy-gear/:key',
  async handler (req, res) {
    const { user } = res.locals;
    const buyGearRes = await common.ops.buy(user, req, res.analytics);
    await user.save();
    res.respond(200, ...buyGearRes);
  },
};

/**
 * @api {post} /api/v3/user/buy-armoire Buy an Enchanted Armoire item
 * @apiName UserBuyArmoire
 * @apiGroup User
 *
 * @apiSuccess {Object} data.items User's item inventory
 * @apiSuccess {Object} data.flags User's flags
 * @apiSuccess {Object} data.armoire Item given by the armoire
 * @apiSuccess {String} message Success message
 *
 * @apiSuccessExample {json} Received a fish:
 *  {
 *   "success": true,
 *   "data": {
 *     ---DATA TRUNCATED---
 *     "armoire": {
 *       "type": "food",
 *       "dropKey": "Fish",
 *       "dropArticle": "a ",
 *       "dropText": "Fish"
 *     }
 *   },
 *
 *  @apiError (400) {NotAuthorized} messageNotEnoughGold Not enough gold for the purchase
 *
 *  @apiErrorExample {json} NotAuthorized Not enough gold
 * {"success":false,"error":"NotAuthorized","message":"Not Enough Gold"}
 */
api.buyArmoire = {
  method: 'POST',
  middlewares: [authWithHeaders()],
  url: '/user/buy-armoire',
  async handler (req, res) {
    const { user } = res.locals;
    req.type = 'armoire';
    req.params.key = 'armoire';
    if (OFFICIAL_PLATFORMS.indexOf(req.headers['x-client']) === -1) {
      res.analytics = undefined;
    }
    const buyArmoireResponse = await common.ops.buy(user, req, res.analytics);
    await user.save();
    res.respond(200, ...buyArmoireResponse);
  },
};

/**
 * @api {post} /api/v3/user/buy-health-potion Buy a health potion
 * @apiName UserBuyPotion
 * @apiGroup User
 *
 * @apiSuccess {Object} data User's current stats
 * @apiSuccess {String} message Success message
 *
 * @apiSuccessExample Example return:
 *  {
 *   "success": true,
 *   "data": {
 *     ---DATA TRUNCATED---
 *   },
 *   "message": "Bought Health Potion"
 * }
 *
 *  @apiError (400) {NotAuthorized} messageNotEnoughGold Not enough gold for the purchase
 *  @apiError (400) {NotAuthorized} messageHealthAlreadyMax Health is already full.
 *
 *  @apiErrorExample {json} NotAuthorized Not enough gold
 * {"success":false,"error":"NotAuthorized","message":"Not Enough Gold"}
 *  @apiErrorExample {json} NotAuthorized Already at max health
 * {"success":false,"error":"NotAuthorized","message":"You already have maximum health."}
 *
 */
api.buyHealthPotion = {
  method: 'POST',
  middlewares: [authWithHeaders()],
  url: '/user/buy-health-potion',
  async handler (req, res) {
    const { user } = res.locals;
    req.type = 'potion';
    req.params.key = 'potion';
    const buyHealthPotionResponse = await common.ops.buy(user, req, res.analytics);
    await user.save();
    res.respond(200, ...buyHealthPotionResponse);
  },
};

/**
 * @api {post} /api/v3/user/buy-mystery-set/:key Buy a Mystery Item set
 * @apiName UserBuyMysterySet
 * @apiDescription This buys a Mystery Item set using an Hourglass.
 * @apiGroup User
 *
 * @apiParam (Path) {String} key The mystery set to buy
 *
 * @apiSuccess {Object} data.items user.items
 * @apiSuccess {Object} data.purchasedPlanConsecutive user.purchased.plan.consecutive
 * @apiSuccess {String} message Success message
 *
 * @apiSuccessExample{json} Successful purchase
 * {
 *   "success": true,
 *   "data": {
 *     ---DATA TRUNCATED---
 *   },
 *   "message": "Purchased an item set using a Mystic Hourglass!"
 * }
 *
 * @apiError (400) {NotAuthorized} notEnoughHourglasses Not enough Mystic Hourglasses.
 * @apiError (400) {NotFound} mysterySetNotFound Specified item does not exist or already owned.
 *
 * @apiErrorExample {json} Not enough hourglasses
 * {"success":false,"error":"NotAuthorized","message":"You don't have enough Mystic Hourglasses."}
 * @apiErrorExample {json} Already own, or doesn't exist
 * {"success":false,"error":"NotFound","message":"Mystery set not found, or set already owned."}
 */
api.buyMysterySet = {
  method: 'POST',
  middlewares: [authWithHeaders()],
  url: '/user/buy-mystery-set/:key',
  async handler (req, res) {
    const { user } = res.locals;
    req.type = 'mystery';
    const buyMysterySetRes = await common.ops.buy(user, req, res.analytics);
    await user.save();
    res.respond(200, ...buyMysterySetRes);
  },
};

/**
 * @api {post} /api/v3/user/buy-quest/:key Buy a quest with gold
 * @apiName UserBuyQuest
 * @apiGroup User
 *
 * @apiParam (Path) {String} key The quest scroll to buy
 *
 * @apiSuccess {Object} data.quests User's quest list
 * @apiSuccess {String} message Success message
 *
 * @apiSuccessExample {json} Success response:
 * {
 *   "success": true,
 *   "data": {
 *     --- DATA TRUNCATED---
 *   },
 *   "message": "Bought Dilatory Distress, Part 1: Message in a Bottle"
 * }
 *
 * @apiError (400) {NotFound} questNotFound Specified quest does not exist
 * @apiError (400) {NotAuthorized} messageNotEnoughGold Not enough gold for the purchase
 *
 * @apiErrorExample {json} Quest chosen does not exist
 * {"success":false,"error":"NotFound","message":"Quest \"dilatoryDistress99\" not found."}
 * @apiErrorExample {json} You must first complete this quest's prerequisites
 * {"success":false,"error":"NotAuthorized","message":"You must first complete dilatoryDistress2."}
 * @apiErrorExample {json} NotAuthorized Not enough gold
 * {"success":false,"error":"NotAuthorized","message":"Not Enough Gold"}
 *
 */
api.buyQuest = {
  method: 'POST',
  middlewares: [authWithHeaders()],
  url: '/user/buy-quest/:key',
  async handler (req, res) {
    const { user } = res.locals;
    req.type = 'quest';
    const buyQuestRes = await common.ops.buy(user, req, res.analytics);
    await user.save();
    res.respond(200, ...buyQuestRes);
  },
};

/**
 * @api {post} /api/v3/user/buy-special-spell/:key Buy special item (card, avatar transformation)
 * @apiDescription Includes gift cards (e.g., birthday card), and avatar Transformation
 * Items and their antidotes (e.g., Snowball item and Salt reward).
 * @apiName UserBuySpecialSpell
 * @apiGroup User
 *
 * @apiParam (Path) {String} key The special item to buy. Must be one of the keys
 *                               from "content.special", such as birthday, snowball, salt.
 *
 * @apiSuccess {Object} data.stats User's current stats
 * @apiSuccess {Object} data.items User's current inventory
 * @apiSuccess {String} message Success message
 *
 * @apiSuccessExample {json} Purchased a greeting card:
 * {
 *   "success": true,
 *   "data": {
 *   },
 *   "message": "Bought Greeting Card"
 * }
 *
 * @apiError (400) {NotAuthorized} messageNotEnoughGold Not enough gold for the purchase
 *
 *  @apiErrorExample {json} Not enough gold
 * {"success":false,"error":"NotAuthorized","message":"Not Enough Gold"}
 *  @apiErrorExample {json} Item name not found
 * {"success":false,"error":"NotFound","message":"Skill \"happymardigras\" not found."}
 */
api.buySpecialSpell = {
  method: 'POST',
  middlewares: [authWithHeaders()],
  url: '/user/buy-special-spell/:key',
  async handler (req, res) {
    const { user } = res.locals;
    req.type = 'special';
    const buySpecialSpellRes = await common.ops.buy(user, req);
    await user.save();
    res.respond(200, ...buySpecialSpellRes);
  },
};

/**
 * @api {post} /api/v3/user/hatch/:egg/:hatchingPotion Hatch a pet
 * @apiName UserHatch
 * @apiGroup User
 *
 * @apiParam (Path) {String} egg The egg to use
 * @apiParam (Path) {String} hatchingPotion The hatching potion to use
 * @apiParamExample {URL} Example-URL
 * https://habitica.com/api/v3/user/hatch/Dragon/CottonCandyPink
 *
 * @apiSuccess {Object} data user.items
 * @apiSuccess {String} message
 *
 * @apiSuccessExample {json} Successfully hatched
 *  {
 *   "success": true,
 *   "data": {},
 *   "message": "Your egg hatched! Visit your stable to equip your pet."
 * }
 *
 * @apiError {NotAuthorized} messageAlreadyPet Already have the specific pet combination
 * @apiError {NotFound} messageMissingEggPotion One or both of the ingredients are missing.
 * @apiError {NotFound} messageInvalidEggPotionCombo Cannot use that combination of egg and potion.
 *
 * @apiErrorExample {json} Already have that pet.
 * {"success":false,"error":"NotAuthorized","message":"You already have that pet.
 * Try hatching a different combination"}
 * @apiErrorExample {json} Either potion or egg (or both) not in inventory
 * {"success":false,"error":"NotFound","message":"You're missing either that egg or that potion"}
 * @apiErrorExample {json} Cannot use that combination
 * {"success":false,"error":"NotAuthorized","message":"You can't hatch Quest
 * Pet Eggs with Magic Hatching Potions! Try a different egg."}
 */
api.hatch = {
  method: 'POST',
  middlewares: [authWithHeaders()],
  url: '/user/hatch/:egg/:hatchingPotion',
  async handler (req, res) {
    const { user } = res.locals;
    const hatchRes = common.ops.hatch(user, req, res.analytics);

    await user.save();

    res.respond(200, ...hatchRes);

    // Send webhook
    const petKey = `${req.params.egg}-${req.params.hatchingPotion}`;

    userActivityWebhook.send(user, {
      type: 'petHatched',
      pet: petKey,
      message: hatchRes[1],
    });
  },
};

/**
 * @api {post} /api/v3/user/equip/:type/:key Equip or unequip an item
 * @apiName UserEquip
 * @apiGroup User
 *
 * @apiParam (Path) {String="mount","pet","costume","equipped"} type The type of item
 *                                                                   to equip or unequip.
 * @apiParam (Path) {String} key The item to equip or unequip
 *
 * @apiParamExample {URL} Example-URL
 * https://habitica.com/api/v3/user/equip/equipped/weapon_warrior_2
 *
 * @apiSuccess {Object} data user.items
 * @apiSuccess {String} message Optional success message for unequipping an items
 *
 * @apiSuccessExample {json} Example return:
 *  {
 *   "success": true,
 *   "data": {---DATA TRUNCATED---},
 *   "message": "Training Sword unequipped."
 * }
 *
 * @apiError {NotFound} notOwned Item is not in inventory, item doesn't
 *                               exist, or item is of the wrong type.
 *
 * @apiErrorExample {json} Item not owned or doesn't exist.
 * {"success":false,"error":"NotFound","message":"You do not own this item."}
 * {"success":false,"error":"NotFound","message":"You do not own this pet."}
 * {"success":false,"error":"NotFound","message":"You do not own this mount."}
 *
 */
api.equip = {
  method: 'POST',
  middlewares: [authWithHeaders()],
  url: '/user/equip/:type/:key',
  async handler (req, res) {
    const { user } = res.locals;
    const equipRes = common.ops.equip(user, req);
    await user.save();
    res.respond(200, ...equipRes);
  },
};

/**
 * @api {post} /api/v3/user/feed/:pet/:food Feed a pet
 * @apiName UserFeed
 * @apiGroup User
 *
 * @apiParam (Path) {String} pet
 * @apiParam (Path) {String} food
 * @apiParam (Query) {Number} [amount] The amount of food to feed.
 *                                     Note: Pet can eat 50 units.
 *                                     Preferred food offers 5 units per food,
 *                                     other food 2 units.
 *
 * @apiParamExample {url} Example-URL
 * https://habitica.com/api/v3/user/feed/Armadillo-Shade/Chocolate
 * https://habitica.com/api/v3/user/feed/Armadillo-Shade/Chocolate?amount=9
 *
 * @apiSuccess {Number} data The pet value
 * @apiSuccess {String} message Success message
 *
 * @apiSuccessExample {json} Example success:
 * {"success":true,"data":10,"message":"Shade Armadillo
 * really likes the Chocolate!","notifications":[]}
 *
 * @apiError {NotFound} PetNotOwned :pet not found in user.items.pets
 * @apiError {BadRequest} InvalidPet Invalid pet name supplied.
 * @apiError {NotFound} FoodNotOwned :food not found in user.items.food
 *                                   Note: also sent if food name is invalid.
 * @apiError {NotAuthorized} notEnoughFood :Not enough food to feed the pet as requested.
 * @apiError {NotAuthorized} tooMuchFood :You try to feed too much food. Action ancelled.
 *
 *
 */
api.feed = {
  method: 'POST',
  middlewares: [authWithHeaders()],
  url: '/user/feed/:pet/:food',
  async handler (req, res) {
    const { user } = res.locals;
    const feedRes = common.ops.feed(user, req, res.analytics);

    await user.save();

    res.respond(200, ...feedRes);

    // Send webhook
    const petValue = feedRes[0];

    if (petValue === -1) { // evolved to mount
      userActivityWebhook.send(user, {
        type: 'mountRaised',
        pet: req.params.pet,
        message: feedRes[1],
      });
    }
  },
};

/**
 * @api {post} /api/v3/user/change-class Change class
 * @apiDescription User must be at least level 10. If ?class is
 * defined and user.flags.classSelected is false it'll change the class.
 * If user.preferences.disableClasses it'll enable classes, otherwise it
 * sets user.flags.classSelected to false (costs 3 gems).
 * @apiName UserChangeClass
 * @apiGroup User
 *
 * @apiParam (Query) {String} class Query parameter - ?class={warrior|rogue|wizard|healer}
 *
 * @apiSuccess {Object} data.flags user.flags
 * @apiSuccess {Object} data.stats user.stats
 * @apiSuccess {Object} data.preferences user.preferences
 * @apiSuccess {Object} data.items user.items
 *
 * @apiError {NotAuthorized} Gems Not enough gems, if class was already
 *                           selected and gems needed to be paid.
 * @apiError {NotAuthorized} Level To change class you must be at least level 10.
 *
 * @apiErrorExample {json} Example error:
 * {"success":false,"error":"NotAuthorized","message":"Not enough Gems"}
 */
api.changeClass = {
  method: 'POST',
  middlewares: [authWithHeaders()],
  url: '/user/change-class',
  async handler (req, res) {
    const { user } = res.locals;
    const changeClassRes = await common.ops.changeClass(user, req, res.analytics);
    await user.save();
    res.respond(200, ...changeClassRes);
  },
};

/**
 * @api {post} /api/v3/user/disable-classes Disable classes
 * @apiName UserDisableClasses
 * @apiGroup User
 *
 * @apiSuccess {Object} data.flags user.flags
 * @apiSuccess {Object} data.stats user.stats
 * @apiSuccess {Object} data.preferences user.preferences
 */
api.disableClasses = {
  method: 'POST',
  middlewares: [authWithHeaders()],
  url: '/user/disable-classes',
  async handler (req, res) {
    const { user } = res.locals;
    const disableClassesRes = common.ops.disableClasses(user, req);
    await user.save();
    res.respond(200, ...disableClassesRes);
  },
};

/**
 * @api {post} /api/v3/user/purchase/:type/:key Purchase Gem or Gem-purchasable item
 * @apiName UserPurchase
 * @apiGroup User
 *
 * @apiParam (Path) {String="gems","eggs","hatchingPotions","premiumHatchingPotions"
                    ,"food","quests","gear","pets"} type Type of item to purchase.
 * @apiParam (Path) {String} key Item's key (use "gem" for purchasing gems)
 *
 * @apiParam (Body) {Integer} [quantity=1] Count of items to buy.
 *                                         Defaults to 1 and is ignored
 *                                         for items where quantity is irrelevant.
 *
 * @apiSuccess {Object} data.items user.items
 * @apiSuccess {Number} data.balance user.balance
 * @apiSuccess {String} message Success message
 *
 * @apiError {NotAuthorized} NotAvailable Item is not available to be purchased
 *                                        (not unlocked for the user).
 * @apiError {NotAuthorized} Gems Not enough gems
 * @apiError {NotFound} Key Key not found for Content type.
 * @apiError {NotFound} Type Type invalid.
 *
 * @apiErrorExample {json} Example error:
 * {"success":false,"error":"NotAuthorized","message":
 * "This item is not currently available for purchase."}
 */
api.purchase = {
  method: 'POST',
  middlewares: [authWithHeaders()],
  url: '/user/purchase/:type/:key',
  async handler (req, res) {
    const { user } = res.locals;
    const type = get(req.params, 'type');
    const key = get(req.params, 'key');

    // Some groups limit their members ability to obtain gems
    // The check is async so it's done on the server only and not on the client,
    // resulting in a purchase that will seem successful until the request hit the server.
    if (type === 'gems' && key === 'gem') {
      const canGetGems = await user.canGetGems();
      if (!canGetGems) throw new NotAuthorized(res.t('groupPolicyCannotGetGems'));
    }

    // Req is currently used as options. Slightly confusing, but this will solve that for now.
    let quantity = 1;
    if (req.body.quantity) quantity = req.body.quantity;
    req.quantity = quantity;

    const purchaseRes = await common.ops.buy(user, req, res.analytics);
    await user.save();
    res.respond(200, ...purchaseRes);
  },
};

/**
 * @api {post} /api/v3/user/purchase-hourglass/:type/:key Purchase Hourglass-purchasable item
 * @apiName UserPurchaseHourglass
 * @apiDescription Purchases an Hourglass-purchasable item.
 * Does not include Mystery Item sets (use /api/v3/user/buy-mystery-set/:key).
 * @apiGroup User
 *
 * @apiParam (Path) {String="pets","mounts"} type The type of item to purchase
 * @apiParam (Path) {String} key Ex: {Phoenix-Base}. The key for the mount/pet
 *
 * @apiParam (Body) {Integer} [quantity=1] Count of items to buy.
 *                                         Defaults to 1 and is ignored
 *                                         for items where quantity is irrelevant.
 *
 * @apiSuccess {Object} data.items user.items
 * @apiSuccess {Object} data.purchasedPlanConsecutive user.purchased.plan.consecutive
 * @apiSuccess {String} message Success message
 *
 * @apiError {NotAuthorized} NotAvailable Item is not available to be purchased or is not valid.
 * @apiError {NotAuthorized} Hourglasses User does not have enough Mystic Hourglasses.
 * @apiError {BadRequest} Quantity Quantity to purchase must be a number.
 * @apiError {NotFound} Type Type invalid.
 *
 * @apiErrorExample {json} Example error:
 * {"success":false,"error":"NotAuthorized","message":"You don't have enough Mystic Hourglasses."}
 */
api.userPurchaseHourglass = {
  method: 'POST',
  middlewares: [authWithHeaders()],
  url: '/user/purchase-hourglass/:type/:key',
  async handler (req, res) {
    const { user } = res.locals;
    const quantity = req.body.quantity || 1;
    if (quantity < 1 || !Number.isInteger(quantity)) throw new BadRequest(res.t('invalidQuantity'), req.language);
    const purchaseHourglassRes = await common.ops.buy(
      user,
      req,
      res.analytics,
      { quantity, hourglass: true },
    );
    await user.save();
    res.respond(200, ...purchaseHourglassRes);
  },
};

/**
 * @api {post} /api/v3/user/read-card/:cardType Read a card
 * @apiName UserReadCard
 * @apiGroup User
 *
 * @apiParam (Path) {String} cardType Type of card to read (e.g. - birthday,
 *                                    greeting, nye, thankyou, valentine).
 *
 * @apiSuccess {Object} data.specialItems user.items.special
 * @apiSuccess {Boolean} data.cardReceived user.flags.cardReceived
 * @apiSuccess {String} message Success message
 *
 * @apiSuccessExample {json} Example success:
 *  {
 *   "success": true,
 *   "data": {
 *     "specialItems": {
 *       "snowball": 0,
 *       "spookySparkles": 0,
 *       "shinySeed": 0,
 *       "seafoam": 0,
 *       "valentine": 0,
 *       "valentineReceived": [],
 *       "nye": 0,
 *       "nyeReceived": [],
 *       "greeting": 0,
 *       "greetingReceived": [
 *          "MadPink"
 *           ],
 *       "thankyou": 0,
 *       "thankyouReceived": [],
 *       "birthday": 0,
 *       "birthdayReceived": []
 *     },
 *     "cardReceived": false
 *   },
 *   "message": "valentine has been read"
 * }
 *
 * @apiError {NotAuthorized} CardType Unknown card type.
 */
api.readCard = {
  method: 'POST',
  middlewares: [authWithHeaders()],
  url: '/user/read-card/:cardType',
  async handler (req, res) {
    const { user } = res.locals;
    const readCardRes = common.ops.readCard(user, req);
    await user.save();
    res.respond(200, ...readCardRes);
  },
};

/**
 * @api {post} /api/v3/user/open-mystery-item Open the Mystery Item box
 * @apiName UserOpenMysteryItem
 * @apiGroup User
 *
 * @apiSuccess {Object} data The item obtained
 * @apiSuccess {String} message Success message
 *
 * @apiSuccessExample {json} Example success:
 * { "success": true,
 *   "data": {
 *     "mystery": "201612",
 *     "value": 0,
 *     "type": "armor",
 *     "key": "armor_mystery_201612",
 *     "set": "mystery-201612",
 *     "klass": "mystery",
 *     "index": "201612",
 *     "str": 0,
 *     "int": 0,
 *     "per": 0,
 *     "con": 0
 *   },
 *   "message": "Mystery item opened."
 *
 * @apiError {BadRequest} Empty No mystery items to open.
 *
 * @apiErrorExample {json} Example error:
 * {"success":false,"error":"BadRequest","message":"Mystery items are empty"}
 */
api.userOpenMysteryItem = {
  method: 'POST',
  middlewares: [authWithHeaders()],
  url: '/user/open-mystery-item',
  async handler (req, res) {
    const { user } = res.locals;
    const openMysteryItemRes = common.ops.openMysteryItem(user, req, res.analytics);
    await user.save();
    res.respond(200, ...openMysteryItemRes);
  },
};

/* @api {post} /api/v3/user/release-pets Release pets
 * @apiName UserReleasePets
 * @apiGroup User
 *
 * @apiSuccess {Object} data.items `user.items.pets`
 * @apiSuccess {String} message Success message
 *
 * @apiSuccessExample {json} Example success:
 *  {
 *   "success": true,
 *   "data": {
 *   },
 *   "message": "Pets released"
 * }
 *
 * @apiError {NotAuthorized} Gems Not enough gems
 *
 * @apiErrorExample {json} Example error:
 * {"success":false,"error":"NotAuthorized","message":"Not enough Gems"}
 */
api.userReleasePets = {
  method: 'POST',
  middlewares: [authWithHeaders()],
  url: '/user/release-pets',
  async handler (req, res) {
    const { user } = res.locals;
    const releasePetsRes = await common.ops.releasePets(user, req, res.analytics);
    await user.save();
    res.respond(200, ...releasePetsRes);
  },
};

/**
 * @api {post} /api/v3/user/release-both Release pets and mounts and grants Triad Bingo
 * @apiName UserReleaseBoth
 * @apiGroup User
 *
 * @apiSuccess {Object} data.achievements
 * @apiSuccess {Object} data.items
 * @apiSuccess {Number} data.balance
 * @apiSuccess {String} message Success message
 *
 * @apiSuccessExample {json} Example success:
 *  {
 *   "success": true,
 *   "data": {
 *     "achievements": {
 *       "ultimateGearSets": {},
 *       "challenges": [],
 *       "quests": {},
 *       "perfect": 0,
 *       "beastMaster": true,
 *       "beastMasterCount": 1,
 *       "mountMasterCount": 1,
 *       "triadBingoCount": 1,
 *       "mountMaster": true,
 *       "triadBingo": true
 *     },
 *     "items": {}
 *   },
 *   "message": "Mounts and pets released"
 * }
 *
 * @apiError {NotAuthorized} Gems Not enough gems
 *
 * @apiErrorExample {json} Example error:
 * {"success":false,"error":"NotAuthorized","message":"Not enough Gems"}

 */
api.userReleaseBoth = {
  method: 'POST',
  middlewares: [authWithHeaders()],
  url: '/user/release-both',
  async handler (req, res) {
    const { user } = res.locals;
    const releaseBothRes = common.ops.releaseBoth(user, req, res.analytics);
    await user.save();
    res.respond(200, ...releaseBothRes);
  },
};

/**
 * @api {post} /api/v3/user/release-mounts Release mounts
 * @apiName UserReleaseMounts
 * @apiGroup User
 *
 * @apiSuccess {Object} data user.items.mounts
 * @apiSuccess {String} message Success message
 *
 * @apiSuccessExample {json} Example success:
 *  {
 *   "success": true,
 *   "data": {
 *     },
 *     "items": {}
 *   },
 *   "message": "Mounts released"
 * }
 *
 * @apiError {NotAuthorized} Gems Not enough gems
 *
 * @apiErrorExample {json} Example error:
 * {"success":false,"error":"NotAuthorized","message":"Not enough Gems"}
 *
 */
api.userReleaseMounts = {
  method: 'POST',
  middlewares: [authWithHeaders()],
  url: '/user/release-mounts',
  async handler (req, res) {
    const { user } = res.locals;
    const releaseMountsRes = await common.ops.releaseMounts(user, req, res.analytics);
    await user.save();
    res.respond(200, ...releaseMountsRes);
  },
};

/**
 * @api {post} /api/v3/user/sell/:type/:key Sell a gold-sellable item owned by the user
 * @apiName UserSell
 * @apiGroup User
 *
 * @apiParam (Path) {String="eggs","hatchingPotions","food"} type The type of item to sell.
 * @apiParam (Path) {String} key The key of the item
 * @apiParam (Query) {Number} [amount] The amount to sell
 *
 * @apiSuccess {Object} data.stats
 * @apiSuccess {Object} data.items
 *
 * @apiError {NotFound} InvalidKey Key not found for user.items eggs
 *                                 (either the key does not exist or the
 *                                 user has none in inventory).
 * @apiError {NotAuthorized} InvalidType Type is not a valid type.
 *
 * @apiErrorExample {json} Example error:
 * {"success":false,"error":"NotAuthorized","message":"Type is not sellable.
 * Must be one of the following eggs, hatchingPotions, food"}
 */
api.userSell = {
  method: 'POST',
  middlewares: [authWithHeaders()],
  url: '/user/sell/:type/:key',
  async handler (req, res) {
    const { user } = res.locals;
    const sellRes = common.ops.sell(user, req);
    await user.save();
    res.respond(200, ...sellRes);
  },
};

/**
 * @api {post} /api/v3/user/unlock Unlock item or set of items by purchase
 * @apiName UserUnlock
 * @apiGroup User
 *
 * @apiParam (Query) {String} path Full path to unlock. See "content" API call for list of items.
 *
 * @apiParamExample {curl} Example call:
 * curl -X POST https://habitica.com/api/v3/user/unlock?path=background.midnight_clouds
 * curl -X POST https://habitica.com/api/v3/user/unlock?path=hair.color.midnight
 *
 * @apiSuccess {Object} data.purchased
 * @apiSuccess {Object} data.items
 * @apiSuccess {Object} data.preferences
 * @apiSuccess {String} message "Items have been unlocked"
 *
 * @apiSuccessExample {json} Example success:
 * {
 *  "success": true,
 *  "data": {},
 *  "message": "Items have been unlocked"
 * }
 *
 * @apiError {BadRequest} Path Path to unlock not specified
 * @apiError {NotAuthorized} Gems Not enough gems available.
 * @apiError {NotAuthorized} Unlocked Full set already unlocked.
 *
 * @apiErrorExample {json} Example error:
 * {"success":false,"error":"BadRequest","message":"Path string is required"}
 * {"success":false,"error":"NotAuthorized","message":"Full set already unlocked."}
 */
api.userUnlock = {
  method: 'POST',
  middlewares: [authWithHeaders()],
  url: '/user/unlock',
  async handler (req, res) {
    const { user } = res.locals;
    const unlockRes = await common.ops.unlock(user, req, res.analytics);
    await user.save();
    res.respond(200, ...unlockRes);
  },
};

/**
 * @api {post} /api/v3/user/revive Revive user from death
 * @apiName UserRevive
 * @apiGroup User
 *
 * @apiSuccess {Object} data user.items
 * @apiSuccess {String} message Success message
 *
 *
 * @apiError {NotAuthorized} NotDead Cannot revive player if player is not dead yet
 *
 * @apiErrorExample {json} Example error:
 * {"success":false,"error":"NotAuthorized","message":"Cannot revive if not dead"}
 */
api.userRevive = {
  method: 'POST',
  middlewares: [authWithHeaders()],
  url: '/user/revive',
  async handler (req, res) {
    const { user } = res.locals;
    const reviveRes = common.ops.revive(user, req, res.analytics);
    await user.save();
    res.respond(200, ...reviveRes);
  },
};

/* NOTE this route has also an API v4 version */

/**
 * @api {post} /api/v3/user/rebirth Use Orb of Rebirth on user
 * @apiName UserRebirth
 * @apiGroup User
 *
 * @apiSuccess {Object} data.user
 * @apiSuccess {Array} data.tasks User's modified tasks (no rewards)
 * @apiSuccess {String} message Success message
 *
 * @apiSuccessExample {json} Example success:
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
 * @apiError {NotAuthorized} Gems Not enough gems
 *
 * @apiErrorExample {json} Example error:
 * {"success":false,"error":"NotAuthorized","message":"Not enough Gems"}
 */
api.userRebirth = {
  method: 'POST',
  middlewares: [authWithHeaders()],
  url: '/user/rebirth',
  async handler (req, res) {
    await userLib.rebirth(req, res, { isV3: true });
  },
};

/**
 * @api {post} /api/v3/user/block/:uuid Block / unblock a user from sending you a PM
 * @apiName BlockUser
 * @apiGroup User
 *
 * @apiParam (Path) {UUID} uuid The uuid of the user to block / unblock
 *
 * @apiSuccess {Array} data user.inbox.blocks
 *
 * @apiSuccessExample {json} Example return:
 * {"success":true,"data":["e4842579-g987-d2d2-8660-2f79e725fb79"],"notifications":[]}
 *
 * @apiError {BadRequest} InvalidUUID UUID is incorrect.
 *
 */
api.blockUser = {
  method: 'POST',
  middlewares: [authWithHeaders()],
  url: '/user/block/:uuid',
  async handler (req, res) {
    const { user } = res.locals;
    const blockUserRes = common.ops.blockUser(user, req);
    await user.save();
    res.respond(200, ...blockUserRes);
  },
};

/* NOTE this route has also an API v4 version */

/**
 * @api {delete} /api/v3/user/messages/:id Delete a message
 * @apiName deleteMessage
 * @apiGroup User
 *
 * @apiParam (Path) {UUID} id The id of the message to delete
 *
 * @apiSuccess {Object} data user.inbox.messages
 * @apiSuccessExample {json} Example return:
 * {
 *   "success": true,
 *   "data": {
 *     "74d9a2e7-4c6e-4f3b-c3c4-517873f41592": {
 *       "sort": 0,
 *       "user": "MadPink",
 *       "backer": {},
 *       "contributor": {},
 *       "uuid": "b0413351-405f-416f-9999-947ec1c85199",
 *       "flagCount": 0,
 *       "flags": {},
 *       "likes": {},
 *       "timestamp": 1487276826704,
 *       "text": "Hi there!",
 *       "id": "74d9a2e7-4c6e-4f3b-c3c4-517873f41592"
 *     }
 *   }
 * }
 */
api.deleteMessage = {
  method: 'DELETE',
  middlewares: [authWithHeaders()],
  url: '/user/messages/:id',
  async handler (req, res) {
    const { user } = res.locals;

    await inboxLib.deleteMessage(user, req.params.id);

    res.respond(200, ...[await inboxLib.getUserInbox(user, { asArray: false })]);
  },
};

/* NOTE this route has also an API v4 version */

/**
 * @api {delete} /api/v3/user/messages Delete all messages
 * @apiName clearMessages
 * @apiGroup User
 *
 * @apiSuccess {Object} data user.inbox.messages which should be empty
 *
 * @apiSuccessExample {json} Example return:
 * {"success":true,"data":{},"notifications":[]}
 */
api.clearMessages = {
  method: 'DELETE',
  middlewares: [authWithHeaders()],
  url: '/user/messages',
  async handler (req, res) {
    const { user } = res.locals;

    await inboxLib.clearPMs(user);

    res.respond(200, ...[]);
  },
};

/**
 * @api {post} /api/v3/user/mark-pms-read Mark Private Messages as read
 * @apiName markPmsRead
 * @apiGroup User
 *
 * @apiSuccess {Object} data user.inbox.newMessages
 *
 * @apiSuccessExample {json} Example return:
 * {"success":true,"data":[0,"Your private messages have been marked as read"],"notifications":[]}
 *
 */
api.markPmsRead = {
  method: 'POST',
  middlewares: [authWithHeaders()],
  url: '/user/mark-pms-read',
  async handler (req, res) {
    const { user } = res.locals;
    const markPmsResponse = common.ops.markPmsRead(user);
    await user.save();
    res.respond(200, markPmsResponse);
  },
};

/* NOTE this route has also an API v4 version */

/**
 * @api {post} /api/v3/user/reroll Reroll a user (reset tasks) using the Fortify Potion
 * @apiName UserReroll
 * @apiGroup User
 *
 * @apiSuccess {Object} data.user
 * @apiSuccess {Object} data.tasks User's modified tasks (no rewards)
 * @apiSuccess {Object} message Success message
 *
 * @apiSuccessExample {json} Example success:
 *  {
 *   "success": true,
 *   "data": {
 *   },
 *   "message": "Fortify complete!"
 * }
 *
 * @apiError {NotAuthorized} Gems Not enough gems
 *
 * @apiErrorExample {json} Example error:
 * {"success":false,"error":"NotAuthorized","message":"Not enough Gems"}
 */
api.userReroll = {
  method: 'POST',
  middlewares: [authWithHeaders()],
  url: '/user/reroll',
  async handler (req, res) {
    await userLib.reroll(req, res, { isV3: true });
  },
};

/* NOTE this route has also an API v4 version */

/**
 * @api {post} /api/v3/user/reset Reset user
 * @apiName UserReset
 * @apiGroup User
 *
 * @apiSuccess {Object} data.user
 * @apiSuccess {Array} data.tasksToRemove IDs of removed tasks
 * @apiSuccess {String} message Success message
 *
 * @apiSuccessExample {json} Example success:
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
    await userLib.reset(req, res, { isV3: true });
  },
};

/**
 * @api {post} /api/v3/user/custom-day-start Set Custom Day Start time for user.
 * @apiName setCustomDayStart
 * @apiGroup User
 *
 * @apiParam (Body) {number} [dayStart=0] The hour number 0-23 for day to begin.
 *                                        If not supplied, will default to 0.
 *
 * @apiParamExample {json} Request-Example:
 * {"dayStart":2}
 *
 * @apiSuccess {Object} data An empty Object
 * @apiSuccess {String} message Success message
 *
 * @apiSuccessExample {json} Success-Example:
 * {"success":true,"data":{"message":"Your custom day start has changed."},"notifications":[]}
 *
 * @apiError {BadRequest} Validation Value provided is not a number, or is outside the range of 0-23
 *
 * @apiErrorExample {json} Error-Example:
 * {"success":false,"error":"BadRequest","message":"User validation failed",
 * "errors":[{"message":"Path `preferences.dayStart` (25) is more than maximum allowed value (23)."
 * ,"path":"preferences.dayStart","value":25}]}
 */
api.setCustomDayStart = {
  method: 'POST',
  middlewares: [authWithHeaders()],
  url: '/user/custom-day-start',
  async handler (req, res) {
    const { user } = res.locals;
    const { dayStart } = req.body;

    user.preferences.dayStart = dayStart;
    user.lastCron = new Date();

    await user.save();

    res.respond(200, {
      message: res.t('customDayStartHasChanged'),
    });
  },
};

/**
 * @api {get} /user/toggle-pinned-item/:key Toggle an item to be pinned
 * @apiName togglePinnedItem
 * @apiGroup User
 *
 * @apiSuccess {Object} data Pinned items array
 *
 * @apiSuccessExample {json} Result:
 *  {
 *   "success": true,
 *   "data": {
 *     "pinnedItems": [
 *        "type": "gear",
 *        "path": "gear.flat.weapon_1"
 *     ]
 *   }
 * }
 *
 */
api.togglePinnedItem = {
  method: 'GET',
  middlewares: [authWithHeaders()],
  url: '/user/toggle-pinned-item/:type/:path',
  async handler (req, res) {
    const { user } = res.locals;
    const path = get(req.params, 'path');
    const type = get(req.params, 'type');

    common.ops.pinnedGearUtils.togglePinnedItem(user, { type, path }, req);

    await user.save();

    const userJson = user.toJSON();

    res.respond(200, {
      pinnedItems: userJson.pinnedItems,
      unpinnedItems: userJson.unpinnedItems,
    });
  },
};

/**
 * @api {post} /api/v3/user/move-pinned-item/:type/:path/move/to/:position
 * Move a pinned item in the rewards column to a new position after being sorted
 * @apiName MovePinnedItem
 * @apiGroup User
 *
 * @apiParam (Path) {String} path The unique item path used for pinning
 * @apiParam (Path) {Number} position Where to move the task.
 *                                    0 = top of the list ("push to top").
 *                                   -1 = bottom of the list ("push to bottom").
 *
 * @apiSuccess {Array} data The new pinned items order.
 *
 * @apiSuccessExample {json} Example success:
 * {"success":true,"data":{"path":"quests.mayhemMistiflying3","type":"quests",
 * "_id": "5a32d357232feb3bc94c2bdf"},"notifications":[]}
 *
 * @apiUse TaskNotFound
 */
api.movePinnedItem = {
  method: 'POST',
  url: '/user/move-pinned-item/:path/move/to/:position',
  middlewares: [authWithHeaders()],
  async handler (req, res) {
    req.checkParams('path', res.t('taskIdRequired')).notEmpty();
    req.checkParams('position', res.t('positionRequired')).notEmpty().isNumeric();

    const validationErrors = req.validationErrors();
    if (validationErrors) throw validationErrors;

    const { user } = res.locals;
    const { path } = req.params;
    let position = Number(req.params.position);

    // If something has been added or removed from the inAppRewards, we need
    // to reset pinnedItemsOrder to have the correct length. Since inAppRewards
    // Uses the current pinnedItemsOrder to return these in the right order,
    // the new reset array will be in the right order before we do the swap
    const currentPinnedItems = common.inAppRewards(user);
    if (user.pinnedItemsOrder.length !== currentPinnedItems.length) {
      user.pinnedItemsOrder = currentPinnedItems.map(item => item.path);
    }

    const officialItems = common.getOfficialPinnedItems(user);

    const itemExistInPinnedArray = user.pinnedItems.findIndex(item => item.path === path);
    const itemExistInOfficialItems = officialItems.findIndex(item => item.path === path);

    if (itemExistInPinnedArray === -1 && itemExistInOfficialItems === -1) {
      throw new BadRequest(res.t('wrongItemPath', { path }, req.language));
    }

    // Adjust the order
    const currentIndex = user.pinnedItemsOrder.findIndex(item => item === path);
    const currentPinnedItemPath = user.pinnedItemsOrder[currentIndex];

    if (currentIndex !== -1) {
      // Remove the one we will move
      user.pinnedItemsOrder.splice(currentIndex, 1);
    } else {
      // usually the array would be already fixed by the inAppRewards call
      // but it seems something didn't work out
      position = Math.min(position, user.pinnedItemsOrder.length - 1);
    }

    // reinsert the item in position (or just at the end)
    if (position === -1) {
      user.pinnedItemsOrder.push(currentPinnedItemPath);
    } else {
      user.pinnedItemsOrder.splice(position, 0, currentPinnedItemPath);
    }

    await user.save();
    const userJson = user.toJSON();

    res.respond(200, userJson.pinnedItemsOrder);
  },
};

export default api;
