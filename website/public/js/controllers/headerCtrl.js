"use strict";

habitrpg.controller("HeaderCtrl", ['$scope', 'Groups', 'User',
  function($scope, Groups, User) {

    $scope.Math = window.Math;
    $scope.user = User.user;

    $scope.nextMilestone = {};
    $scope.milestones = {
     4:  "Pets + Mounts Unlocked",
     10: "Class System Unlocked",
     11: "First Skill Unlocked",
     12: "Second Skill Unlocked",
     13: "Third Skill Unlocked",
     14: "Final Skill Unlocked",
     15: "Quest Line: Attack of the Mundane",
     30: "Quest Line: Vice the Shadow Wyrm",
     40: "Quest Line: The Golden Knight",
     60: "Quest Line: Recidivate the Necromancer",
     100: "Free Orb of Rebirth"
    };

    $scope.party = Groups.party(function(){
        var triggerResort = function() {
            $scope.partyMinusSelf = resortParty();
        };

        triggerResort();
        $scope.$watch('user.party.order', triggerResort);
        $scope.$watch('user.party.orderAscending', triggerResort);
    });

    function resortParty() {
      var result = _.sortBy(
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
              case 'name':
                return member.profile.name;
                break;
              case 'backgrounds':
                return member.preferences.background;
                break;
              case 'habitrpg_date_joined':
                return member.auth.timestamps.created;
                break
              case 'habitrpg_last_logged_in':
                return member.auth.timestamps.loggedin;
                break
              default:
                // party date joined
                return true;
          }
        }
      )
      if (User.user.party.orderAscending == "descending") {
      	result = result.reverse()
      }

      return result;
    }

    $scope.getNextMilestone = function() {

     for (var levelRequirement in $scope.milestones) {
      if ($scope.user.stats.lvl < parseInt(levelRequirement)){
       $scope.nextMilestone = {
        level: levelRequirement,
        text: $scope.milestones[levelRequirement]
       }
       return;
      }
     }
     $scope.nextMilestone = {};
    }
    $scope.getNextMilestone();
  }
]);
