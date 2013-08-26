'use strict';

/*

Statz controller

- Retrieves statz from localStorage.
- Exposes the model to the template and provides event handlers


*/


habitrpg.controller( 'StatsCtrl', function StatsCtrl( $scope, $location, filterFilter, User ) {
        $scope.refreshing = function () {
          return User.settings.fetching ? "spin" : ""
        };
        $scope.queueLength = function () {
          return User.settings.sync.queue.length || User.settings.sync.sent.length
        };
        $scope.stats = User.user.stats;

});
