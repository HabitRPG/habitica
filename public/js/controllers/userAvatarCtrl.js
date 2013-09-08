"use strict";

habitrpg.controller("UserAvatarCtrl", ['$scope', '$location', 'User',
  function($scope, $location, User) {
  $scope.profile = User.user;
  $scope.hideUserAvatar = function() {
    $(".userAvatar").hide();
  };
}]);
