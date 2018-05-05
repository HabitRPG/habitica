import { authWithHeaders } from '../../middlewares/auth';
import ensureDevelpmentMode from '../../middlewares/ensureDevelpmentMode';
import { BadRequest } from '../../libs/errors';
import { content } from '../../../common';
import _ from 'lodash';

/**
 * @apiDefine Development Development
 * These routes only exist while Habitica is in development mode. (Such as running a local instance on your computer)
 */

/**
 * @apiDefine Developers Local Development
 * This route only exists when developing Habitica in non-production environment.
 */

let api = {};

/**
 * @api {post} /api/v3/debug/add-ten-gems Add ten gems to the current user
 * @apiName AddTenGems
 * @apiGroup Development
 * @apiPermission Developers
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
 * @api {post} /api/v3/debug/add-hourglass Add Hourglass to the current user
 * @apiName AddHourglass
 * @apiGroup Development
 * @apiPermission Developers
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
 * @api {post} /api/v3/debug/set-cron Set lastCron for user
 * @apiName setCron
 * @apiGroup Development
 * @apiPermission Developers
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
 * @apiName setCron
 * @apiGroup Development
 * @apiPermission Developers
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

/**
 * @api {post} /api/v3/debug/modify-inventory Manipulate user's inventory
 * @apiName modifyInventory
 * @apiGroup Development
 * @apiPermission Developers
 *
 * @apiParam (Body) {Object} gear Object to replace user's <code><a href="https://github.com/HabitRPG/habitica/blob/develop/website/server/models/user/schema.js#L243">gear.owned</a></code> object.
 * @apiParam (Body) {Object} special Object to replace user's <code><a href="https://github.com/HabitRPG/habitica/blob/develop/website/server/models/user/schema.js#272">special</a></code> object.
 * @apiParam (Body) {Object} pets Object to replace user's <code><a href="https://github.com/HabitRPG/habitica/blob/develop/website/server/models/user/schema.js#296">pets</a></code> object.
 * @apiParam (Body) {Object} mounts Object to replace user's <code><a href="https://github.com/HabitRPG/habitica/blob/develop/website/server/models/user/schema.js#329">mounts</a></code> object.
 * @apiParam (Body) {Object} eggs Object to replace user's <code><a href="https://github.com/HabitRPG/habitica/blob/develop/website/server/models/user/schema.js#310">eggs</a></code> object.
 * @apiParam (Body) {Object} hatchingPotions Object to replace user's <code><a href="https://github.com/HabitRPG/habitica/blob/develop/website/server/models/user/schema.js#316">hatchingPotions</a></code> object.
 * @apiParam (Body) {Object} food Object to replace user's <code><a href="https://github.com/HabitRPG/habitica/blob/develop/website/server/models/user/schema.js#322">food</a></code> object.
 * @apiParam (Body) {Object} quests Object to replace user's <code><a href="https://github.com/HabitRPG/habitica/blob/develop/website/server/models/user/schema.js#344">quests</a></code> object.
 * @apiSuccess {Object} data An empty Object
 */
api.modifyInventory = {
  method: 'POST',
  url: '/debug/modify-inventory',
  middlewares: [ensureDevelpmentMode, authWithHeaders()],
  async handler (req, res) {
    let user = res.locals.user;
    let { gear } = req.body;

    if (gear) {
      user.items.gear.owned = gear;
    }

    [
      'special',
      'pets',
      'mounts',
      'eggs',
      'hatchingPotions',
      'food',
      'quests',
    ].forEach((type) => {
      if (req.body[type]) {
        user.items[type] = req.body[type];
      }
    });

    await user.save();

    res.respond(200, {});
  },
};

/**
 * @api {post} /api/v3/debug/quest-progress Artificially accelerate quest progress
 * @apiName questProgress
 * @apiGroup Development
 * @apiPermission Developers
 *
 * @apiSuccess {Object} data An empty Object
 */
api.questProgress = {
  method: 'POST',
  url: '/debug/quest-progress',
  middlewares: [ensureDevelpmentMode, authWithHeaders()],
  async handler (req, res) {
    let user = res.locals.user;
    let key = _.get(user, 'party.quest.key');
    let quest = content.quests[key];

    if (!quest) {
      throw new BadRequest('User is not on a valid quest.');
    }

    if (quest.boss) {
      if (!user.party.quest.progress.up) user.party.quest.progress.up = 0;
      user.party.quest.progress.up += 1000;
    }

    if (quest.collect) {
      if (!user.party.quest.progress.collectedItems) user.party.quest.progress.collectedItems = 0;
      user.party.quest.progress.collectedItems += 300;
    }

    user.markModified('party.quest.progress');

    await user.save();

    res.respond(200, {});
  },
};

module.exports = api;
