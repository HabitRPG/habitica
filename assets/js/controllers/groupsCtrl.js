"use strict";

habitrpg

  .controller("GroupsCtrl", ['$scope', '$rootScope', 'Groups', '$http', 'API_URL', '$q',
    function($scope, $rootScope, Groups, $http, API_URL, $q) {

      $scope.isMember = function(user, group){
        return ~group.members.indexOf(user._id);
      }

      // The user may not visit the public guilds, personal guilds, and tavern pages. So
      // we defer loading them to the html until they've clicked the tabs
      var partyQ = $q.defer(),
          guildsQ = $q.defer(),
          publicQ = $q.defer(),
          tavernQ = $q.defer();

      $scope.groups = {
        party: partyQ.promise,
        guilds: guildsQ.promise,
        public: publicQ.promise,
        tavern: tavernQ.promise
      };

      // But we don't defer triggering Party, since we always need it for the header if nothing else
      Groups.query({type:'party'}, function(_groups){
        partyQ.resolve(_groups[0]);
      })

      // Note the _.once() to make sure it can never be called again
      $scope.fetchGuilds = _.once(function(){
        $('#loading-indicator').show();
        Groups.query({type:'guilds'}, function(_groups){
          guildsQ.resolve(_groups);
          $('#loading-indicator').hide();
        })
        Groups.query({type:'public'}, function(_groups){
          publicQ.resolve(_groups);
        })
      });

      $scope.fetchTavern = _.once(function(){
        $('#loading-indicator').show();
        Groups.query({type:'tavern'}, function(_groups){
          $('#loading-indicator').hide();
          tavernQ.resolve(_groups[0]);
        })
      });

      //$scope._chatMessage = '';
      $scope.postChat = function(group, message){
        //FIXME ng-model makes this painfully slow! using jquery for now, which is really non-angular-like
        message = $('.chat-textarea').val();
        if (_.isEmpty(message)) return
        $('.chat-btn').addClass('disabled');
        group.$postChat({message:message}, function(data){
          //$scope._chatMessage = '';
          $('.chat-textarea').val('');
          group.chat = data.chat;
          $('.chat-btn').removeClass('disabled');
        });
      }
    }
  ])

  .controller("GuildsCtrl", ['$scope', 'Groups',
    function($scope, Groups) {
      $scope.type = 'guild';
      $scope.text = 'Guild';

      $scope.join = function(group){
        group.$join(function(saved){
          //$scope.groups.guilds.push(saved);
          alert('Joined guild, refresh page to see changes')
        })
      }

      $scope.leave = function(group){
        group.$leave();
//        var i = _.find($scope.groups.guilds, {_id:group._id});
//        if (~i) $scope.groups.guilds.splice(i, 1);
        alert('Left guild, refresh page to see changes')
      }
    }
  ])

  .controller("PartyCtrl", ['$scope', 'Groups',
    function($scope, Groups) {
      $scope.type = 'party';
      $scope.text = 'Party';
      $scope.group = $scope.groups.party;
    }
  ])

  .controller("TavernCtrl", ['$scope', 'Groups',
    function($scope, Groups) {
      $scope.group = $scope.groups.tavern;
    }
  ])