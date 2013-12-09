"use strict";

habitrpg.controller("HeaderCtrl", ['$scope', 'Groups', 'User',
  function($scope, Groups, User) {
    var getParty = function() {
      return Groups.party(function(party) {
        $scope.partyMinusSelf = _.sortBy(
          _.filter(party.members, function(member){
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
    getParty();

    $scope.partyOrderChoices = {
      'level': 'Sort by Level',
      'contrib': 'Sort by Contributors level',
      'created': 'Sort by Oldest members',
      'lastseen': 'Sort by Last Seen',
      'random': 'Sort randomly',
      'pets': 'Sort by Number of pets',
      'party_date_joined': 'Sort by Party date joined',
    };
    $scope.updatePartyOrder = function () {
      User.set('party.order', $scope.user.party.order);
      getParty();
    }
  }
]);
