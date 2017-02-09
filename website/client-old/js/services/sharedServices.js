'use strict';

/**
 * Services that expose habitrpg-shared
 */

angular.module('habitrpg')
.factory('Shared', [function () {
  return window.habitrpgShared;
}])
.factory('Content', ['Shared', '$http', function (Shared, $http) {

  function loadContent () {
    $http({
      method: 'GET',
      url: '/api/v3/content',
    })
    .then(function (response) {
      Shared.content = response.data.data;
    });
  }

  loadContent();

  return Shared.content;
}]);
