'use strict';

habitrpg.controller("TavernCtrl", ['$scope', 'Groups', 'User',
    function($scope, Groups, User) {
      $scope.group = Groups.tavern();
      $scope.toggleUserTier = function($event) {
        $($event.target).next().toggle();
      }
    }
  ]);
