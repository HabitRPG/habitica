'use strict';

habitrpg.controller('StatsCtrl',
  ['$scope', 'User',
  function($scope, User) {
    $scope.refreshing = function () {
      return User.settings.fetching ? "spin" : ""
    };
    $scope.queueLength = function () {
      return User.settings.sync.queue.length || User.settings.sync.sent.length
    };
    $scope.stats = User.user.stats;
  }
]);
