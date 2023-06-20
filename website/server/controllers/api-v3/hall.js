import _ from 'lodash';
import validator from 'validator';
import { authWithHeaders } from '../../middlewares/auth';
import { ensurePermission } from '../../middlewares/ensureAccessRight';
import { model as User } from '../../models/user';
import { model as Group } from '../../models/group';
import common from '../../../common';
import {
  NotFound,
} from '../../libs/errors';
import apiError from '../../libs/apiError';
import {
  validateItemPath,
  castItemVal,
} from '../../libs/items/utils';

const api = {};

/**
 * @api {get} /api/v3/hall/patrons Get all patrons
 * @apiDescription Returns an array of objects containing the patrons who backed Habitica's
 * original kickstarter. The array is sorted by the backer tier in descending order.
 * By default, only the first 50 patrons are returned. More can be accessed by passing ?page=n
 * @apiName GetPatrons
 * @apiGroup Hall
 *
 * @apiParam (Query) {Number} [page=0] The result page.
 * @apiSuccess {Array} data An array of patrons
 *
 * @apiSuccessExample {json} Example response
 * {
 *   "success": true,
 *   "data": [
 *     {
 *       "_id": "3adb52a9-0dfb-4752-81f2-a62d911d1bf5",
 *       "profile": {
 *         "name": "mattboch"
 *       },
 *       "contributor": {},
 *       "backer": {
 *         "tier": 800,
 *         "npc": "Beast Master"
 *       }
 *     },
 *     {
 *       "_id": "9da65443-ed43-4c21-804f-d260c1361596",
 *       "profile": {
 *         "name": "ʎǝlᴉɐq s,┴I"
 *       },
 *       "contributor": {
 *         "text": "Pollen Purveyor",
 *         "admin": true,
 *         "level": 8
 *       },
 *       "backer": {
 *         "npc": "Town Crier",
 *         "tier": 800,
 *         "tokensApplied": true
 *       }
 *     }
 *   ]
 * }
 *
 *
 * @apiUse NoAuthHeaders
 * @apiUse NoAccount
 */
api.getPatrons = {
  method: 'GET',
  url: '/hall/patrons',
  middlewares: [authWithHeaders()],
  async handler (req, res) {
    req.checkQuery('page').optional().isInt({ min: 0 }, apiError('queryPageInteger'));

    const validationErrors = req.validationErrors();
    if (validationErrors) throw validationErrors;

    const page = req.query.page ? Number(req.query.page) : 0;
    const perPage = 50;

    const patrons = await User
      .find({
        'backer.tier': { $gt: 0 },
      })
      .select('contributor backer profile.name')
      .sort('-backer.tier')
      .skip(page * perPage)
      .limit(perPage)
      .lean()
      .exec();

    res.respond(200, patrons);
  },
};

/**
 * @api {get} /api/v3/hall/heroes Get all Heroes (contributors)
 * @apiName GetHeroes
 * @apiGroup Hall
 *
 * @apiDescription Returns an array of objects containing the heroes who have
 * contributed for Habitica. The array is sorted by the contribution level in descending order.
 *
 * @apiSuccess {Array} heroes An array of heroes
 *
 * @apiSuccessExample {json} Example response:
 * {
 *   "success": true,
 *   "data": [
 *    {
 *      "_id": "e6e01d2a-c2fa-4b9f-9c0f-7865b777e7b5",
 *      "profile": {
 *        "name": "test2"
 *      },
 *      "contributor": {
 *        "admin": false,
 *        "level": 2,
 *        "text": "Linguist"
 *      },
 *      "backer": {}
 *     }
 *   ]
 * }
 *
 * @apiUse NoAuthHeaders
 * @apiUse NoAccount
 */
api.getHeroes = {
  method: 'GET',
  url: '/hall/heroes',
  middlewares: [authWithHeaders()],
  async handler (req, res) {
    const heroes = await User
      .find({
        'contributor.level': { $gt: 0 },
      })
      .select('contributor backer profile.name')
      .sort('-contributor.level')
      .lean()
      .exec();

    res.respond(200, heroes);
  },
};

// Note, while the following routes are called getHero / updateHero
// they can be used by admins to get/update any user

const heroAdminFields = 'auth balance contributor flags items lastCron party preferences profile.name purchased secret permissions';
const heroAdminFieldsToFetch = heroAdminFields; // these variables will make more sense when...
const heroAdminFieldsToShow = heroAdminFields; // ... apiTokenObscured is added

const heroPartyAdminFields = 'balance challengeCount leader leaderOnly memberCount purchased quest';
// must never include Party name, description, summary, leaderMessage

/**
 * @api {get} /api/v3/hall/heroes/:heroId Get any user ("hero") given the UUID or Username
 * @apiParam (Path) {UUID} heroId user ID
 * @apiName GetHero
 * @apiGroup Hall
 * @apiPermission Admin
 *
 * @apiDescription Returns various data about the user. User does not need to be a contributor.
 *
 * @apiSuccess {Object} data The user object
 *
 * @apiUse NoAuthHeaders
 * @apiUse NoAccount
 * @apiUse NoUser
 * @apiUse NotAdmin
 */
api.getHero = {
  method: 'GET',
  url: '/hall/heroes/:heroId',
  middlewares: [authWithHeaders(), ensurePermission('userSupport')],
  async handler (req, res) {
    req.checkParams('heroId', res.t('heroIdRequired')).notEmpty();

    const validationErrors = req.validationErrors();
    if (validationErrors) throw validationErrors;

    const { heroId } = req.params;

    let query;
    if (validator.isUUID(heroId)) {
      query = { _id: heroId };
    } else {
      query = { 'auth.local.lowerCaseUsername': heroId.toLowerCase() };
    }

    const hero = await User
      .findOne(query)
      .select(heroAdminFieldsToFetch)
      .exec();

    if (!hero) throw new NotFound(res.t('userWithIDNotFound', { userId: heroId }));
    const heroRes = hero.toJSON({ minimize: true });
    // supply to the possible absence of hero.contributor
    // if we didn't pass minimize: true it would have returned all fields as empty
    if (!heroRes.contributor) heroRes.contributor = {};

    heroRes.secret = hero.getSecretData();

    res.respond(200, heroRes);
  },
};

// e.g., tier 5 gives 4 gems. Tier 8 = moderator. Tier 9 = staff
const gemsPerTier = {
  1: 3, 2: 3, 3: 3, 4: 4, 5: 4, 6: 4, 7: 4, 8: 0, 9: 0,
};

/**
 * @api {put} /api/v3/hall/heroes/:heroId Update any user ("hero")
 * @apiParam (Path) {UUID} heroId User ID
 * @apiName UpdateHero
 * @apiGroup Hall
 * @apiPermission Admin
 *
 * @apiDescription Update various details in the user's User document,
 * including but not limited to privileges, gems, contributions, items.
 *
 * @apiExample Example Body:
 * {
 *    "balance": 1000,
 *    "auth": {"blocked": false},
 *    "flags": {
 *      "chatRevoked": true,
 *      "chatShadowMuted": true
 *    },
 *    "purchased": {"ads": true},
 *    "contributor": {
 *      "admin": true,
 *      "newsPoster": false,
 *      "contributions": "Improving API documentation",
 *      "level": 5,
 *      "text": "Scribe, Blacksmith"
 *    },
 *    "secret": {
 *      "text": "child with permission to use site",
 *    },
 *    "itemPath": "items.pets.BearCub-Skeleton",
 *    "itemVal": 5,
 *    "changeApiToken": true,
 * }
 *
 * @apiSuccess {Object} data The updated user object
 *
 * @apiUse NoAuthHeaders
 * @apiUse NoAccount
 * @apiUse NoUser
 * @apiUse NotAdmin
 */
api.updateHero = {
  method: 'PUT',
  url: '/hall/heroes/:heroId',
  middlewares: [authWithHeaders(), ensurePermission('userSupport')],
  async handler (req, res) {
    const { heroId } = req.params;
    const updateData = req.body;

    req.checkParams('heroId', res.t('heroIdRequired')).notEmpty().isUUID();

    const validationErrors = req.validationErrors();
    if (validationErrors) throw validationErrors;

    const hero = await User.findById(heroId).exec();
    if (!hero) throw new NotFound(res.t('userWithIDNotFound', { userId: heroId }));

    if (updateData.balance && updateData.balance !== hero.balance) {
      await hero.updateBalance(updateData.balance - hero.balance, 'admin_update_balance', '', 'Given by Habitica staff');

      hero.balance = updateData.balance;
    }

    if (updateData.purchased && updateData.purchased.plan) {
      if (updateData.purchased.plan.gemsBought) {
        hero.purchased.plan.gemsBought = updateData.purchased.plan.gemsBought;
      }
      if (updateData.purchased.plan.perkMonthCount) {
        hero.purchased.plan.perkMonthCount = updateData.purchased.plan.perkMonthCount;
      }
      if (updateData.purchased.plan.consecutive) {
        if (updateData.purchased.plan.consecutive.trinkets) {
          const changedHourglassTrinkets = updateData.purchased.plan.consecutive.trinkets
              - hero.purchased.plan.consecutive.trinkets;

          if (changedHourglassTrinkets !== 0) {
            await hero.updateHourglasses(
              changedHourglassTrinkets,
              'admin_update_hourglasses', '', 'Updated by Habitica staff',
            );
          }

          hero.purchased.plan.consecutive.trinkets = updateData.purchased.plan.consecutive.trinkets;
        }
        if (updateData.purchased.plan.consecutive.gemCapExtra) {
          hero.purchased.plan.consecutive.gemCapExtra = updateData.purchased.plan.consecutive.gemCapExtra; // eslint-disable-line max-len
        }
        if (updateData.purchased.plan.consecutive.count) {
          hero.purchased.plan.consecutive.count = updateData.purchased.plan.consecutive.count; // eslint-disable-line max-len
        }
      }
    }

    // give them gems if they got an higher level
    // tier = level in this context
    let newTier = updateData.contributor && updateData.contributor.level;

    const oldTier = (hero.contributor && hero.contributor.level) || 0;
    if (newTier > oldTier) {
      hero.flags.contributor = true;
      let tierDiff = newTier - oldTier; // can be 2+ tier increases at once
      while (tierDiff) {
        await hero.updateBalance(gemsPerTier[newTier] / 4, 'contribution', newTier); // eslint-disable-line no-await-in-loop
        tierDiff -= 1;
        newTier -= 1; // give them gems for the next tier down if they weren't already that tier
      }

      hero.addNotification('NEW_CONTRIBUTOR_LEVEL');
    }

    if (updateData.contributor) _.assign(hero.contributor, updateData.contributor);
    if (updateData.permissions && res.locals.user.hasPermission('userSupport')) _.assign(hero.permissions, updateData.permissions);
    if (updateData.purchased && updateData.purchased.ads) {
      hero.purchased.ads = updateData.purchased.ads;
    }

    // give them the Dragon Hydra pet if they're above level 6
    if (hero.contributor.level >= 6) {
      hero.items.pets['Dragon-Hydra'] = 5;
      hero.markModified('items.pets');
    }
    if (updateData.itemPath && updateData.itemVal && validateItemPath(updateData.itemPath)) {
      // Sanitization at 5c30944 (deemed unnecessary)
      _.set(hero, updateData.itemPath, castItemVal(updateData.itemPath, updateData.itemVal));
    }

    if (updateData.auth && updateData.auth.blocked === true) {
      hero.auth.blocked = updateData.auth.blocked;
      hero.preferences.sleep = true; // when blocking, have them rest at an inn to prevent damage
    }
    if (updateData.auth && updateData.auth.blocked === false) {
      hero.auth.blocked = false;
    }

    if (updateData.flags && _.isBoolean(updateData.flags.chatRevoked)) {
      hero.flags.chatRevoked = updateData.flags.chatRevoked;
    }
    if (updateData.flags && _.isBoolean(updateData.flags.chatShadowMuted)) {
      hero.flags.chatShadowMuted = updateData.flags.chatShadowMuted;
    }

    if (updateData.secret) {
      if (typeof updateData.secret.text !== 'undefined') {
        hero.secret.text = updateData.secret.text;
      }
    }

    if (updateData.changeApiToken) {
      hero.apiToken = common.uuid();
    }

    if (updateData.resetCron) {
      // Set last cron to yesterday. Quick approach so we don't need moment() for one line
      const yesterday = new Date(new Date().setDate(new Date().getDate() - 1));
      hero.lastCron = yesterday;
      hero.auth.timestamps.loggedin = yesterday; // so admin panel doesn't gripe about mismatch
    }

    const savedHero = await hero.save();
    const heroJSON = savedHero.toJSON();
    heroJSON.secret = savedHero.getSecretData();
    const responseHero = { _id: heroJSON._id }; // only respond with important fields
    heroAdminFieldsToShow.split(' ').forEach(field => {
      _.set(responseHero, field, _.get(heroJSON, field));
    });

    res.respond(200, responseHero);
  },
};

/**
 * @api {get} /api/v3/hall/heroes/party/:groupId Get any Party given its ID
 * @apiParam (Path) {UUID} groupId party's group ID
 * @apiName GetHeroParty
 * @apiGroup Hall
 * @apiPermission userSupport
 *
 * @apiDescription Returns some basic information about a given Party,
 * to assist admins with user support.
 *
 * @apiSuccess {Object} data The party object (contains computed fields
 * that are not in the Group model)
 *
 * @apiUse NoAuthHeaders
 * @apiUse NoAccount
 * @apiUse NoUser
 * @apiUse NoPrivs
 * @apiUse groupIdRequired
 * @apiUse GroupNotFound
 */
api.getHeroParty = { // @TODO XXX add tests
  method: 'GET',
  url: '/hall/heroes/party/:groupId',
  middlewares: [authWithHeaders(), ensurePermission('userSupport')],
  async handler (req, res) {
    req.checkParams('groupId', apiError('groupIdRequired')).notEmpty().isUUID();

    const validationErrors = req.validationErrors();
    if (validationErrors) throw validationErrors;

    const { groupId } = req.params;

    const query = { _id: groupId, type: 'party' };

    const party = await Group
      .findOne(query)
      .select(heroPartyAdminFields)
      .exec();

    if (!party) throw new NotFound(apiError('groupWithIDNotFound', { groupId }));
    const partyRes = party.toJSON();
    res.respond(200, partyRes);
  },
};

export default api;
