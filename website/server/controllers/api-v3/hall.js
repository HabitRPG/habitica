import { authWithHeaders } from '../../middlewares/auth';
import { ensureAdmin } from '../../middlewares/ensureAccessRight';
import { model as User } from '../../models/user';
import {
  NotFound,
} from '../../libs/errors';
import _ from 'lodash';

/**
 * @apiDefine Admin Moderators
 * Contributors of tier 8 or higher can use this route.
 */

let api = {};

/**
 * @api {get} /api/v3/hall/patrons Get all patrons
 * @apiDescription Only the first 50 patrons are returned. More can be accessed passing ?page=n
 * @apiName GetPatrons
 * @apiGroup Hall
 *
 * @apiParam {Number} page Query Parameter - The result page. Default is 0
 *
 * @apiSuccess {Array} data An array of patrons
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
 * @apiSuccess {Array} data An array of heroes
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
 * @apiName GetHero
 * @apiGroup Hall
 *
 * @apiSuccess {Object} data The user object
 *
 * @apiPermission Admin
 *
 * @apiUse UserNotFound
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
 * @apiDescription Must be an admin to make this request.
 * @apiName UpdateHero
 * @apiGroup Hall
 *
 * @apiSuccess {Object} data The updated user object
 *
 * @apiPermission Admin
 *
 * @apiUse UserNotFound
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

    if (updateData.auth && _.isBoolean(updateData.auth.blocked)) {
      hero.auth.blocked = updateData.auth.blocked;
      hero.preferences.sleep = true; // when blocking, have them rest at an inn to prevent damage
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
