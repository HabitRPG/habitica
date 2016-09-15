'use strict';

angular.module('habitrpg')
.factory('Hall', [ '$rootScope', 'ApiUrl', '$http',
  function($rootScope, ApiUrl, $http) {
    var apiV3Prefix = '/api/v3';
    var Hall = {};

    Hall.getHeroes = function () {
      return $http({
        method: 'GET',
        url: apiV3Prefix + '/hall/heroes',
      });
    }

    Hall.getHero = function (uuid) {
      return $http({
        method: 'GET',
        url: apiV3Prefix + '/hall/heroes/' + uuid,
      });
    }

    Hall.updateHero = function (heroDetails) {
      return $http({
        method: 'PUT',
        url: apiV3Prefix + '/hall/heroes/' + heroDetails._id,
        data: heroDetails,
      });
    }

    Hall.getPatrons = function (page) {
      if (!page) page = 0;

      return $http({
        method: 'GET',
        url: apiV3Prefix + '/hall/patrons?page=' + page,
      });
    }

    return Hall;
 }]);
