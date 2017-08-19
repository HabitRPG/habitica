import { authWithHeaders } from '../../middlewares/auth';
import { ensureAdmin } from '../../middlewares/ensureAccessRight';
import { model as User } from '../../models/user';
import {
  NotFound,
} from '../../libs/errors';
import _ from 'lodash';

let api = {};

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
    req.checkQuery('page', res.t('pageMustBeNumber')).optional().isNumeric();

    let validationErrors = req.validationErrors();
    if (validationErrors) throw validationErrors;

    let page = req.query.page ? Number(req.query.page) : 0;
    const perPage = 50;

    let patrons = await User
    .find({
      'backer.tier': {$gt: 0},
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
 * @api {get} /api/v3/hall/heroes Get all Heroes
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
    let heroes = await User
    .find({
      'contributor.level': {$gt: 0},
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

const heroAdminFields = 'contributor balance profile.name purchased items auth flags.chatRevoked';

/**
 * @api {get} /api/v3/hall/heroes/:heroId Get any user ("hero") given the UUID
 * @apiParam (Path) {UUID} heroId user ID
 * @apiName GetHero
 * @apiGroup Hall
 * @apiPermission Admin
 *
 * @apiDescription Returns the profile of the given user
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
  middlewares: [authWithHeaders(), ensureAdmin],
  async handler (req, res) {
    let heroId = req.params.heroId;

    req.checkParams('heroId', res.t('heroIdRequired')).notEmpty().isUUID();

    let validationErrors = req.validationErrors();
    if (validationErrors) throw validationErrors;

    let hero = await User
      .findById(heroId)
      .select(heroAdminFields)
      .exec();

    if (!hero) throw new NotFound(res.t('userWithIDNotFound', {userId: heroId}));
    let heroRes = hero.toJSON({minimize: true});
    // supply to the possible absence of hero.contributor
    // if we didn't pass minimize: true it would have returned all fields as empty
    if (!heroRes.contributor) heroRes.contributor = {};
    res.respond(200, heroRes);
  },
};

// e.g., tier 5 gives 4 gems. Tier 8 = moderator. Tier 9 = staff
const gemsPerTier = {1: 3, 2: 3, 3: 3, 4: 4, 5: 4, 6: 4, 7: 4, 8: 0, 9: 0};

/**
 * @api {put} /api/v3/hall/heroes/:heroId Update any user ("hero")
 * @apiParam (Path) {UUID} heroId user ID
 * @apiName UpdateHero
 * @apiGroup Hall
 * @apiPermission Admin
 *
 * @apiDescription Update user's gem balance, contributions & contribution tier and admin status. Grant items, block / unblock user's account and revoke / unrevoke chat privileges.
 *
 * @apiExample Example Body:
 * {
 *    "balance": 1000,
 *    "auth": {"blocked": false},
 *    "flags": {"chatRevoked": true},
 *    "purchased": {"ads": true},
 *    "contributor": {
 *      "admin": true,
 *      "contributions": "Improving API documentation",
 *      "level": 5,
 *      "text": "Scribe, Blacksmith"
 *    },
 *    "itemPath": "items.pets.BearCub-Skeleton",
 *    "itemVal": 1
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
  middlewares: [authWithHeaders(), ensureAdmin],
  async handler (req, res) {
    let heroId = req.params.heroId;
    let updateData = req.body;

    req.checkParams('heroId', res.t('heroIdRequired')).notEmpty().isUUID();

    let validationErrors = req.validationErrors();
    if (validationErrors) throw validationErrors;

    let hero = await User.findById(heroId).exec();
    if (!hero) throw new NotFound(res.t('userWithIDNotFound', {userId: heroId}));

    if (updateData.balance) hero.balance = updateData.balance;

    // give them gems if they got an higher level
    let newTier = updateData.contributor && updateData.contributor.level; // tier = level in this context
    let oldTier = hero.contributor && hero.contributor.level || 0;
    if (newTier > oldTier) {
      hero.flags.contributor = true;
      let tierDiff = newTier - oldTier; // can be 2+ tier increases at once
      while (tierDiff) {
        hero.balance += gemsPerTier[newTier] / 4; // balance is in $
        tierDiff--;
        newTier--; // give them gems for the next tier down if they weren't aready that tier
      }

      hero.addNotification('NEW_CONTRIBUTOR_LEVEL');
    }

    if (updateData.contributor) _.assign(hero.contributor, updateData.contributor);
    if (updateData.purchased && updateData.purchased.ads) hero.purchased.ads = updateData.purchased.ads;

    // give them the Dragon Hydra pet if they're above level 6
    if (hero.contributor.level >= 6) hero.items.pets['Dragon-Hydra'] = 5;
    if (updateData.itemPath && updateData.itemVal &&
        updateData.itemPath.indexOf('items.') === 0 &&
        User.schema.paths[updateData.itemPath]) {
      _.set(hero, updateData.itemPath, updateData.itemVal); // Sanitization at 5c30944 (deemed unnecessary)
    }

    if (updateData.auth && updateData.auth.blocked === true) {
      hero.auth.blocked = updateData.auth.blocked;
      hero.preferences.sleep = true; // when blocking, have them rest at an inn to prevent damage
    }
    if (updateData.auth && updateData.auth.blocked === false) {
      hero.auth.blocked = false;
    }
    if (updateData.flags && _.isBoolean(updateData.flags.chatRevoked)) hero.flags.chatRevoked = updateData.flags.chatRevoked;

    let savedHero = await hero.save();
    let heroJSON = savedHero.toJSON();
    let responseHero = {_id: heroJSON._id}; // only respond with important fields
    heroAdminFields.split(' ').forEach(field => {
      _.set(responseHero, field, _.get(heroJSON, field));
    });

    res.respond(200, responseHero);
  },
};

module.exports = api;
