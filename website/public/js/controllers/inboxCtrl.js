'use strict';

habitrpg.controller("InboxCtrl", ['$scope', 'Groups', 'User',
    function($scope, Groups, User) {
      $scope.group = {name:'inbox'};
    }
  ]);
