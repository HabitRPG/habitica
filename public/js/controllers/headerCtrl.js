"use strict";

habitrpg.controller("HeaderCtrl", ['$scope', 'Groups', 'User',
  function($scope, Groups, User) {
    $scope.party = Groups.party(function(){
      $scope.partyMinusSelf = _.filter($scope.party.members, function(member){
        return member._id !== User.user._id;
      });
    });
  }
]);
