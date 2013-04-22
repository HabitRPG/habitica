'use strict';

angular.module('habitRPG')
  .controller('MainAvatar', function ($scope, User) {
    $scope.profile = User.get().partyMembers[$scope.$index];
    $scope.hasPet = $scope.profile.items.pet? 'hasPet' : '';
    $scope.party = true;
  });
