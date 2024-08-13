import _ from 'lodash';
import sinon from 'sinon';
import moment from 'moment';
import { authWithHeaders } from '../../middlewares/auth';
import ensureDevelopmentMode from '../../middlewares/ensureDevelopmentMode';
import ensureTimeTravelMode from '../../middlewares/ensureTimeTravelMode';
import { BadRequest } from '../../libs/errors';
import common from '../../../common';
import {
  model as Group,
  // basicFields as basicGroupFields,
} from '../../models/group';

const { content } = common;

/**
 * @apiDefine Development Development
 * These routes only exist while Habitica is in development mode.
 * (Such as running a local instance on your computer).
 */

/**
 * @apiDefine Developers Local Development
 * This route only exists when developing Habitica in non-production environment.
 */

const api = {};

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
  middlewares: [ensureDevelopmentMode, authWithHeaders()],
  async handler (req, res) {
    const { user } = res.locals;

    await user.updateBalance(2.5, 'debug');

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
  middlewares: [ensureDevelopmentMode, authWithHeaders()],
  async handler (req, res) {
    const { user } = res.locals;

    await user.purchased.plan.updateHourglasses(user._id, 1, 'debug');

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
  middlewares: [ensureDevelopmentMode, authWithHeaders()],
  async handler (req, res) {
    const { user } = res.locals;
    const cron = req.body.lastCron;

    user.lastCron = cron;

    await user.save();

    res.respond(200, {});
  },
};

/**
 * @api {post} /api/v3/debug/make-admin Sets admin privileges for current user
 * @apiName setCron
 * @apiGroup Development
 * @apiPermission Developers
 *
 * @apiSuccess {Object} data An empty Object
 */
api.makeAdmin = {
  method: 'POST',
  url: '/debug/make-admin',
  middlewares: [ensureDevelopmentMode, authWithHeaders()],
  async handler (req, res) {
    const { user } = res.locals;

    user.permissions.fullAccess = true;

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
  middlewares: [ensureDevelopmentMode, authWithHeaders()],
  async handler (req, res) {
    const { user } = res.locals;
    const { gear } = req.body;

    if (gear) {
      user.items.gear.owned = gear;
      user.markModified('items.gear.owned');
    }

    [
      'special',
      'pets',
      'mounts',
      'eggs',
      'hatchingPotions',
      'food',
      'quests',
    ].forEach(type => {
      if (req.body[type]) {
        user.items[type] = req.body[type];
        user.markModified(`items.${type}`);
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
  middlewares: [ensureDevelopmentMode, authWithHeaders()],
  async handler (req, res) {
    const { user } = res.locals;
    const key = _.get(user, 'party.quest.key');
    const quest = content.quests[key];

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

/**
 * @api {post} /api/v3/debug/boss-rage Artificially trigger boss rage bar
 * @apiName bossRage
 * @apiGroup Development
 * @apiPermission Developers
 *
 * @apiSuccess {Object} data An empty Object
 */

api.bossRage = {
  method: 'POST',
  url: '/debug/boss-rage',
  middlewares: [ensureDevelopmentMode, authWithHeaders()],
  async handler (req, res) {
    const { user } = res.locals;
    const party = await Group.getGroup({
      user,
      groupId: 'party',
    });

    if (!party) {
      throw new BadRequest('User not in a party.');
    }

    if (!party.quest.progress.rage) party.quest.progress.rage = 0;
    party.quest.progress.rage += 50;

    party.markModified('party.quest.progress.rage');

    await party.save();

    res.respond(200, {});
  },
};

let clock;

function fakeClock () {
  if (clock) clock.restore();
  const time = new Date();
  clock = sinon.useFakeTimers({
    now: time,
    shouldAdvanceTime: true,
  });
}

api.timeTravelTime = {
  method: 'GET',
  url: '/debug/time-travel-time',
  middlewares: [ensureTimeTravelMode, authWithHeaders()],
  async handler (req, res) {
    if (clock === undefined) {
      fakeClock();
    }

    res.respond(200, {
      time: new Date(),
    });
  },
};

api.timeTravelAdjust = {
  method: 'POST',
  url: '/debug/jump-time',
  middlewares: [ensureTimeTravelMode, authWithHeaders()],
  async handler (req, res) {
    const { user } = res.locals;

    if (!user.permissions.fullAccess) {
      throw new BadRequest('You do not have permission to time travel.');
    }

    const { offsetDays, reset, disable } = req.body;
    if (reset) {
      fakeClock();
    } else if (disable) {
      clock.restore();
      clock = undefined;
    } else if (clock !== undefined) {
      try {
        clock.setSystemTime(moment().add(offsetDays, 'days').toDate());
      } catch (e) {
        throw new BadRequest('Error adjusting time');
      }
    } else {
      throw new BadRequest('Invalid command');
    }

    res.respond(200, {
      time: new Date(),
    });
  },
};

export default api;
