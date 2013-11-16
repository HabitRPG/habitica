"use strict";

habitrpg.controller("AdminCtrl", ['$scope', '$rootScope', 'User', 'Notification', 'API_URL', '$resource',
  function($scope, $rootScope, User, Notification, API_URL, $resource) {
    var Contributor = $resource(API_URL + '/api/v1/admin/members/:uid', {uid:'@_id'});

    $scope.profile = undefined;
    $scope.loadUser = function(uuid){
      $scope.profile = Contributor.get({uid:uuid});
    }
    $scope.save = function(profile) {
      profile.$save(function(){
        Notification.text("User updated");
        $scope.profile = undefined;
        $scope._uuid = undefined;
        $scope.contributors = Contributor.query();
      })
    }
    $scope.contributors = Contributor.query();
  }])