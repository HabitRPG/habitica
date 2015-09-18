'use strict';

angular
  .module('habitrpg')
  .factory('Inventory', inventoryFactory);

inventoryFactory.$inject = [
  '$http',
  '$resource',
  'ApiUrl',
  'User'
];

function inventoryFactory($http, $resource, ApiUrl, User) {
  var utils = $resource(ApiUrl.get() + '/api/v2/user/inventory/',
    {key: '@_key', type: '@_type', pet: '@_pet', food: '@_food', egg: '@_egg', hatchingPotion: '@_hatchingPotion'},
    {
      buyList: {method: 'GET', url: ApiUrl.get() + '/api/v2/user/inventory/buy'},
      buy: {method: 'POST', url: ApiUrl.get() + '/api/v2/user/inventory/buy/:key'},
      sell: {method: 'POST', url: ApiUrl.get() + '/api/v2/user/inventory/sell/:type/:key'},
      purchase: {method: 'POST', url: ApiUrl.get() + '/api/v2/user/inventory/purchase/:type/:key'},
      hourglass: {method: 'POST', url: ApiUrl.get() + '/api/v2/user/inventory/hourglass/:type/:key'},
      mystery: {method: 'POST', url: ApiUrl.get() + '/api/v2/user/inventory/mystery/:key'}
    });

  var inventoryService = {
    utils: utils
  };

  return inventoryService;
};
