"use strict";

habitrpg.controller("UserAvatarCtrl", ['$scope', '$location', 'User',
  function($scope, $location, User) {
  $scope.profile = User.user;
  $scope.hideUserAvatar = function() {
    $(".userAvatar").hide();
  };

  $scope.clickAvatar = function(profile) {
    if (User.user.id == profile.id) {
      if ($location.path() == '/tasks') {
        $location.path('/options');
      } else {
        $location.path('/tasks');
      }
    } else {
      //TODO show party member modal
      //$("#avatar-modal-#{uid}").modal('show')
    }
  }
}]);
