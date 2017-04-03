'use strict';

/**
 * Services that handle achievement logic.
 */

angular.module('habitrpg').factory('Achievement',
['$rootScope', function($rootScope) {
  var sizes = ['sm', 'md', 'lg'];
  var DEFAULT_SIZE = 'sm';

  function displayAchievement(achievementName, options) {
    options = options || {};

    if (options.size && sizes.indexOf(options.size) === -1) {
      delete options.size;
    }

    $rootScope.openModal('achievements/' + achievementName, {
      controller: 'UserCtrl',
      size: options.size || DEFAULT_SIZE
    });
  }

  return {
    displayAchievement: displayAchievement
  };
}]);
