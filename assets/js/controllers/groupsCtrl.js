"use strict";

/*
 The authentication controller (login & facebook)
 */

habitrpg.controller("GroupsCtrl", ['$scope', '$rootScope', 'Groups', '$http', '$location',
  function($scope, $rootScope, Groups) {
    $scope.groups = Groups.query();
    $scope.party = true;
  }
]);
