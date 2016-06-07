'use strict';

habitrpg.controller("TavernCtrl", ['$scope', 'Groups', 'User', 'Challenges',
    function($scope, Groups, User, Challenges) {
      Groups.tavern()
        .then(function (tavern) {
          $scope.group = tavern;
          Challenges.getGroupChallenges($scope.group._id)
            .then(function (response) {
              $scope.group.challenges = response.data.data;
            });
        })

      $scope.toggleUserTier = function($event) {
        $($event.target).next().toggle();
      }
    }
  ]);
