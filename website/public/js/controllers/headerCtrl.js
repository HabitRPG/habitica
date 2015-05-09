"use strict";

habitrpg.controller("HeaderCtrl", ['$scope', 'Groups', 'User',
  function($scope, Groups, User) {

    $scope.Math = window.Math;
    $scope.user = User.user;

    $scope.nextMilestone = {};
    $scope.milestones = {
     4:  env.t("petsMountMilestone"),
     10: env.t("classSystemMilestone"),
     11: env.t("firstSkillMilestone"),
     12: env.t("secondSkillMilestone"),
     13: env.t("thirdSkillMilestone"),
     14: env.t("finalSkillMilestone"),
     15: env.t("mundaneMilestone"),
     30: env.t("viceMilestone"),
     40: env.t("goldenKnightMilestone"),
     60: env.t("recidivateMilestone"),
     100: env.t("freeOrbRebirthMilestone")
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
