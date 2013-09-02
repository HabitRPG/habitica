"use strict";

habitrpg.controller("GroupsCtrl", ['$scope', '$rootScope', 'Groups', '$http', 'API_URL', '$q', 'User',
  function($scope, $rootScope, Groups, $http, API_URL, $q, User) {

      $scope.isMember = function(user, group){
        return ~(group.members.indexOf(user._id));
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

      $scope.invitee = '';
      $scope.invite = function(group, uuid){
        group.$invite({uuid:uuid}, function(){
          $scope.invitee = '';
          alert("User invited to group");
        });
      }
    }
  ])

  .controller('ChatCtrl', ['$scope', 'Groups', function($scope, Groups){
    $scope._chatMessage = '';
    $scope.postChat = function(group, message){
      if (_.isEmpty(message)) return
      $('.chat-btn').addClass('disabled');
      group.$postChat({message:message}, function(data){
        $scope._chatMessage = '';
        group.chat = data.chat;
        $('.chat-btn').removeClass('disabled');
      });
    }

  }])

  .controller("GuildsCtrl", ['$scope', 'Groups', 'User', '$rootScope',
    function($scope, Groups, User, $rootScope) {
      $scope.type = 'guild';
      $scope.text = 'Guild';
      $scope.newGroup = new Groups({type:'guild', privacy:'private', leader: User.user._id, members: [User.user._id]});

      $scope.create = function(group){
        if (User.user.balance < 1) {
          return $rootScope.modals.moreGems = true;
//          $('#more-gems-modal').modal('show');
        }

        if (confirm("Create Guild for 4 Gems?")) {
          group.balance = 1;
          group.$save(function(){
            User.user.balance--;
            User.log({op:'set', data:{'balance':User.user.balance}});
            window.setTimeout(function(){window.location.href='/';}, 500)
          })
        }
      }

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

  .controller("PartyCtrl", ['$scope', 'Groups', 'User',
    function($scope, Groups, User) {
      $scope.type = 'party';
      $scope.text = 'Party';
      $scope.newGroup = new Groups({type:'party', leader: User.user._id, members: [User.user._id]});
      $scope.create = function(group){
        group.$save(function(){
          location.reload();
        });
      }


      // TODO Figure out a better way to set variables on GroupsCtrl scope
      var groupsCtrl = angular.element($('#groups-controller')).scope();
      $scope.group = $scope.groups.party;
      $scope.join = function(party){
        var group = new Groups({_id: party.id, name: party.name});
        // there a better way to access GroupsCtrl.groups.party?
        groupsCtrl.groups.party = group.$join(function(){
          groupsCtrl.safeApply(function(){
            User.user.invitations.party = undefined;
          })
        });
      }
      $scope.leave = function(group){
        group.$leave(function(){
          groupsCtrl.safeApply(function(){
            groupsCtrl.groups.party = {};
          })
        });
      }
      $scope.reject = function(){
        User.user.invitations.party = undefined;
        User.log({op:'set',data:{'invitations.party':{}}});
      }
    }
  ])

  .controller("TavernCtrl", ['$scope', 'Groups',
    function($scope, Groups) {
      $scope.group = $scope.groups.tavern;
    }
  ])