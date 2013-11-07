"use strict";

habitrpg.controller("AdminCtrl", ['$scope', '$rootScope', 'User', 'Members', 'Notification',
  function($scope, $rootScope, User, Members, Notification) {
    $scope.profile = undefined;
    $scope.loadUser = function(uuid){
      $scope.profile = Members.Member.get({uid:uuid});
    }
    $scope.save = function(profile) {
      profile.$save(function(){
        Notification.text("User updated");
        $scope.profile = undefined;
        $scope._uuid = undefined;
      })
    }
  }])