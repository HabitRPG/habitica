'use strict';

/**
 * The menu controller:
 * - sets the menu options, should we do it dynamic so it generates the menu like: width = 1/elements * 100 ?
 * - exposes the model to the template and provides event handlers
 */

habitrpg.controller('MenuCtrl',
  ['$scope', '$rootScope', 'User',
  function($scope, $rootScope, User) {

    //FIXME are these used anywhere? can we get rid of this file?

    $scope.refreshing = function () {
      User.settings.fetching ? "spin" : ""
    };

    $scope.queueLength = function () {
      User.settings.sync.queue.length || User.settings.sync.sent.length
    };

  }
]);
