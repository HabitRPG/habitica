"use strict";

habitrpg

  .controller("GroupsCtrl", ['$scope', '$rootScope', 'Groups', '$http', '$location',
    function($scope, $rootScope, Groups) {
      $scope.groups = Groups.query(function(groups){
        $scope.members = groups.members;
      });
      $scope.party = true;
    }
  ])

  .controller("GuildsCtrl", ['$scope', 'Groups',
    function($scope, Groups) {
      $scope.type = 'guild';
      $scope.text = 'Guild';
    }
  ])

  .controller("PartyCtrl", ['$scope', 'Groups',
    function($scope, Groups) {
      $scope.type = 'party';
      $scope.text = 'Party';
      Groups.query(function(groups){
        $scope.group = groups.party;
      })
    }
  ])

  .controller("TavernCtrl", ['$scope', 'Groups',
    function($scope, Groups) {
      //FIXME make sure this query is only called once for all these controllers! If not, let's memoize groups at groupServices level
      Groups.query(function(groups){
        $scope.group = groups.tavern;
      });
    }
  ])