'use strict';

/**
 * Services that handle achievement logic.
 */

angular.module('habitrpg').factory('Achievement',
['$rootScope', function($rootScope) {

  function displayAchievement(achievementName) {
    $rootScope.openModal('achievements/' + achievementName,
      {controller:'UserCtrl', size:'sm'});
  }

  return {
    displayAchievement: displayAchievement
  };
}]);
