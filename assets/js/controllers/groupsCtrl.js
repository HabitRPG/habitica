"use strict";

habitrpg.controller("GroupsCtrl", ['$scope', '$rootScope', 'Groups', '$http', 'API_URL', '$q', 'User',
  function($scope, $rootScope, Groups, $http, API_URL, $q, User) {

      $scope.isMember = function(user, group){
        return ~(group.members.indexOf(user._id));
      }

      $scope.groups = Groups.groups;

      $scope.fetchGuilds = Groups.fetchGuilds;
      $scope.fetchTavern = Groups.fetchTavern;

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
      $scope.newGroup = new Groups.Group({type:'guild', privacy:'private', leader: User.user._id, members: [User.user._id]});

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
      $scope.group = Groups.groups.party;
      $scope.newGroup = new Groups.Group({type:'party', leader: User.user._id, members: [User.user._id]});
      $scope.create = function(group){
        group.$save(function(){
          location.reload();
        });
      }

      $scope.join = function(party){
        var group = new Groups.Group({_id: party.id, name: party.name});
        // there a better way to access GroupsCtrl.groups.party?
        Groups.groups.party = group.$join(function(){
          User.user.invitations.party = undefined;
        });
      }
      $scope.leave = function(group){
        group.$leave(function(){
          Groups.groups.party = new Groups.Group();
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
      $scope.group = Groups.groups.tavern;
    }
  ])