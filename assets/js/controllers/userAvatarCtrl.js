"use strict";

habitrpg.controller("UserAvatarCtrl", function($scope, $location, filterFilter, User) {
  debugger
  $scope.profile = User.user;
  $scope.hideUserAvatar = function() {
    $(".userAvatar").hide();
  };

  $scope.clickAvatar = function(profile) {
    debugger
    if (User.user.id == profile.id) {
      if ($location.path() == '/tasks') {
        $location.path('/options')
      } else {
        $location.path('/tasks');
      }
    } else {
      //TODO show party member modal
      //$("#avatar-modal-#{uid}").modal('show')
    }
  }
});
