'use strict';

/**
 * Services that expose habitrpg-shared
 */

angular.module('habitrpg')
.factory('Shared', [function () {
  return window.habitrpgShared;
}])
.factory('Content', ['Shared', function (Shared) {
  return Shared.content;
}]);
