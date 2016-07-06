import { authWithHeaders } from '../../middlewares/api-v3/auth';
import shops from '../../../../common/script/libs/shops';

let api = {};

/**
 * @apiIgnore
 * @api {get} /api/v3/shops/market get the available items for the market
 * @apiVersion 3.0.0
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
      categories: shops.getMarketCategories(req.language, user)
    };

    res.respond(200, resObject);
  },
};

/**
 * @apiIgnore
 * @api {get} /api/v3/shops/seasonal-shop get the available items for the seasonal shop
 * @apiVersion 3.0.0
 * @apiName GetSeasonalShopItems
 * @apiGroup Shops
 *
 * @apiSuccess {Object} data List of push devices
 * @apiSuccess {string} message Success message
 */
api.getSeasonalShopItems = {
  method: 'GET',
  url: '/shops/seasonal-shop',
  middlewares: [authWithHeaders()],
  async handler (req, res) {
    let user = res.locals.user;

    let resObject = {
      identifier: 'seasonalShop',
      text: res.t('seasonalShop'),
      categories: shops.getSeasonalShopCategories(req.language, user)
    };

    res.respond(200, resObject);
  },
};

module.exports = api;
