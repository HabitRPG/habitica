'use strict';

angular.module('habitRPG')
  .controller('MainAvatarCtrl', function ($scope, User) {
    $scope.profile = User.get();
    $scope.hasPet = $scope.profile.items.pet? 'hasPet' : '';
    $scope.isUser = 'isUser';
  });
