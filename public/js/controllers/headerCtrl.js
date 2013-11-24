"use strict";

habitrpg.controller("HeaderCtrl", ['$scope', '$location', 'Groups', 'User',
  function($scope, $location, Groups, User) {

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

      $scope.partyOrderChoices = {
        'level': 'Sort by Level',
        'random': 'Sort randomly',
        'pets': 'Sort by number of pets',
        'party_date_joined': 'Sort by Party date joined',
      };
 
    $scope.updatePartyOrder = function () {
        User.set('party.order', $scope.user.party.order);

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
  }
]);
