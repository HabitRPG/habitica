import { authWithHeaders } from '../../middlewares/auth';
import { shops } from '../../../common/';

let api = {};

/**
 * @apiIgnore
 * @api {get} /api/v3/shops/market get the available items for the market
 * @apiName GetMarketItems
 * @apiGroup Shops
 *
 * @apiSuccess {Object} data List of push devices
 * @apiSuccess {string} message Success message
 */
api.getMarketItems = {
  method: 'GET',
  url: '/shops/market',
  middlewares: [authWithHeaders()],
  async handler (req, res) {
    let user = res.locals.user;

    let resObject = {
      identifier: 'market',
      text: res.t('market'),
      notes: res.t('welcomeMarketMobile'),
      imageName: 'npc_alex',
      categories: shops.getMarketCategories(user, req.language),
    };

    res.respond(200, resObject);
  },
};

/**
 * @apiIgnore
 * @api {get} /api/v3/shops/quests get the available items for the quests shop
 * @apiName GetQuestShopItems
 * @apiGroup Shops
 *
 * @apiSuccess {Object} data List of push devices
 * @apiSuccess {string} message Success message
 */
api.getQuestShopItems = {
  method: 'GET',
  url: '/shops/quests',
  middlewares: [authWithHeaders()],
  async handler (req, res) {
    let user = res.locals.user;

    let resObject = {
      identifier: 'questShop',
      text: res.t('quests'),
      notes: res.t('ianTextMobile'),
      imageName: 'npc_ian',
      categories: shops.getQuestShopCategories(user, req.language),
    };

    res.respond(200, resObject);
  },
};

/**
 * @apiIgnore
 * @api {get} /api/v3/shops/time-travelers get the available items for the time travelers shop
 * @apiName GetTimeTravelersShopItems
 * @apiGroup Shops
 *
 * @apiSuccess {Object} data List of push devices
 * @apiSuccess {string} message Success message
 */
api.getTimeTravelerShopItems = {
  method: 'GET',
  url: '/shops/time-travelers',
  middlewares: [authWithHeaders()],
  async handler (req, res) {
    let user = res.locals.user;
    let hasTrinkets = user.purchased.plan.consecutive.trinkets > 0;

    let resObject = {
      identifier: 'timeTravelersShop',
      text: res.t('timeTravelers'),
      notes: hasTrinkets ? res.t('timeTravelersPopover') : res.t('timeTravelersPopoverNoSubMobile'),
      imageName: hasTrinkets ? 'npc_timetravelers_active' : 'npc_timetravelers',
      categories: shops.getTimeTravelersCategories(user, req.language),
    };

    res.respond(200, resObject);
  },
};

/**
 * @apiIgnore
 * @api {get} /api/v3/shops/seasonal get the available items for the seasonal shop
 * @apiName GetSeasonalShopItems
 * @apiGroup Shops
 *
 * @apiSuccess {Object} data List of push devices
 * @apiSuccess {string} message Success message
 */
api.getSeasonalShopItems = {
  method: 'GET',
  url: '/shops/seasonal',
  middlewares: [authWithHeaders()],
  async handler (req, res) {
    let user = res.locals.user;

    let resObject = {
      identifier: 'seasonalShop',
      text: res.t('seasonalShop'),
      notes: res.t('seasonalShopFallText'),
      imageName: 'seasonalshop_open',
      categories: shops.getSeasonalShopCategories(user, req.language),
    };

    res.respond(200, resObject);
  },
};

module.exports = api;
