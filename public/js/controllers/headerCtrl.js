"use strict";

habitrpg.controller("HeaderCtrl", ['$scope', 'Groups', 'User',
  function($scope, Groups, User) {
    $scope.party = Groups.party();
    $scope.partyMinusSelf = _.filter($scope.party, function(member){
      return member._id !== User.user._id;
    });
  }
]);
