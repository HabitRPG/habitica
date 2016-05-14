'use strict';

habitrpg.controller("TavernCtrl", ['$scope', 'Groups', 'User',
    function($scope, Groups, User) {
      Groups.tavern()
        .then(function (tavern) {
          $scope.group = tavern;
        })

      $scope.toggleUserTier = function($event) {
        $($event.target).next().toggle();
      }
    }
  ]);
