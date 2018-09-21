import { authWithHeaders } from '../../middlewares/auth';
import { shops } from '../../../common/';

let api = {};

/**
 * @apiIgnore
 * @api {get} /api/v3/shops/market get the available items for the market
 * @apiName GetMarketItems
 * @apiGroup Shops
 *
 * @apiSuccess {Object} data List of available items
 * @apiSuccess {string} message Success message
 */
api.getMarketItems = {
  method: 'GET',
  url: '/shops/market',
  middlewares: [authWithHeaders()],
  async handler (req, res) {
    let user = res.locals.user;

    let resObject = shops.getMarketShop(user, req.language);

    res.respond(200, resObject);
  },
};

/**
 * @apiIgnore
 * @api {get} /api/v3/shops/market-gear get the available gear for the market
 * @apiName GetMarketGear
 * @apiGroup Shops
 *
 * @apiSuccess {Object} data List of available gear
 */
api.getMarketGear = {
  method: 'GET',
  url: '/shops/market-gear',
  middlewares: [authWithHeaders()],
  async handler (req, res) {
    let user = res.locals.user;

    let resObject = {
      categories: shops.getMarketGearCategories(user, req.language),
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
 * @apiSuccess {Object} data List of available quests
 * @apiSuccess {string} message Success message
 */
api.getQuestShopItems = {
  method: 'GET',
  url: '/shops/quests',
  middlewares: [authWithHeaders()],
  async handler (req, res) {
    let user = res.locals.user;

    let resObject = shops.getQuestShop(user, req.language);

    res.respond(200, resObject);
  },
};

/**
 * @apiIgnore
 * @api {get} /api/v3/shops/time-travelers get the available items for the time travelers shop
 * @apiName GetTimeTravelersShopItems
 * @apiGroup Shops
 *
 * @apiSuccess {Object} data List of available items
 * @apiSuccess {string} message Success message
 */
api.getTimeTravelerShopItems = {
  method: 'GET',
  url: '/shops/time-travelers',
  middlewares: [authWithHeaders()],
  async handler (req, res) {
    let user = res.locals.user;

    let resObject = shops.getTimeTravelersShop(user, req.language);

    res.respond(200, resObject);
  },
};

/**
 * @apiIgnore
 * @api {get} /api/v3/shops/seasonal get the available items for the seasonal shop
 * @apiName GetSeasonalShopItems
 * @apiGroup Shops
 *
 * @apiSuccess {Object} data List of available items
 * @apiSuccess {string} message Success message
 */
api.getSeasonalShopItems = {
  method: 'GET',
  url: '/shops/seasonal',
  middlewares: [authWithHeaders()],
  async handler (req, res) {
    let user = res.locals.user;

    let resObject = shops.getSeasonalShop(user, req.language);

    res.respond(200, resObject);
  },
};

/**
 * @apiIgnore
 * @api {get} /api/v3/shops/backgrounds get the available items for the backgrounds shop
 * @apiName GetBackgroundsShopItems
 * @apiGroup Shops
 *
 * @apiSuccess {Object} data List of available backgrounds
 * @apiSuccess {string} message Success message
 */
api.getBackgroundShopItems = {
  method: 'GET',
  url: '/shops/backgrounds',
  middlewares: [authWithHeaders()],
  async handler (req, res) {
    let user = res.locals.user;

    let resObject = {
      identifier: 'backgroundShop',
      text: res.t('backgroundShop'),
      notes: res.t('backgroundShopText'),
      imageName: 'background_shop',
      sets: shops.getBackgroundShopSets(user, req.language),
    };

    res.respond(200, resObject);
  },
};

module.exports = api;
