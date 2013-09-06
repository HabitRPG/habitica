'use strict';

habitrpg.controller('StatsCtrl',
  ['$scope', 'User',
  function($scope, User) {
    $scope.refreshing = function () {
      User.settings.fetching ? "spin" : ""
    };
    $scope.queueLength = function () {
      User.settings.sync.queue.length || User.settings.sync.sent.length
    };
    $scope.stats = User.user.stats;
  }
]);
