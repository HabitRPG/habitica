import { authWithHeaders } from '../../middlewares/api-v3/auth';
import shops from '../../../../common/script/libs/shops';
import _ from 'lodash';

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
    console.log(shops);

    let resObject = {
      identifier: 'market',
      text: res.t('market'),
      categories: shops.getMarketCategories(user)
    };

    let propKeys = ['key', 'text', 'notes', 'value', 'currency', 'locked'];
    _.each(categories, category => {
      category.text = category.text(req.language);
      category.notes = category.notes(req.language);
      _.each(category.items, item => {
        _.each(item, (itemPropVal, itemPropKey) => {
          if (propKeys.indexOf(itemPropKey) === -1) {
            delete item[itemPropKey];
          } else {
            if (_.isFunction(itemPropVal) && itemPropVal.i18nLangFunc) item[itemPropKey] = itemPropVal(req.language);
          }
        });
      });
    });

    res.respond(200, resObject);
  },
};

module.exports = api;
