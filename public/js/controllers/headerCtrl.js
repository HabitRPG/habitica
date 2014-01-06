"use strict";

habitrpg.controller("HeaderCtrl", ['$scope', 'Groups', 'User',
  function($scope, Groups, User) {

    $scope.Math = window.Math;

    $scope.party = Groups.party(function(){
      $scope.partyMinusSelf = _.sortBy(
        _.filter($scope.party.members, function(member){
          return member._id !== User.user._id;
        }),
        function (member) {
          switch(User.user.party.order)
          {
              case 'level':
                return member.stats.lvl;
                break;
              case 'random':
                return Math.random();
                break;
              case 'pets':
                return member.items.pets.length;
                break;
              default:
                // party date joined
                return true;
          }
        }
      ).reverse()
    });
  }
]);
