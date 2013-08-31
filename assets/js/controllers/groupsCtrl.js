"use strict";

habitrpg

  .controller("GroupsCtrl", ['$scope', '$rootScope', 'Groups', '$http', '$location', '$http', 'API_URL',
    function($scope, $rootScope, Groups, $http, API_URL) {
      $scope._chatMessage = '';
      $scope.groups = Groups.query(function(groups){
        $scope.members = groups.members;
      });
      $scope.postChat = function(group, message){
        if (_.isEmpty(message)) return
        $('.chat-btn').addClass('disabled');
        $http.post('/api/v1/groups/'+group._id+'/chat', {message:message})
          .success(function(data){
            $scope._chatMessage = '';
            group.chat = data;
            $('.chat-btn').removeClass('disabled');
          });
      }
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