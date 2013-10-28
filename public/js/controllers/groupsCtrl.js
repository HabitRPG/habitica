"use strict";

habitrpg.controller("GroupsCtrl", ['$scope', '$rootScope', 'Groups', '$http', 'API_URL', '$q', 'User', 'Members', '$location',
  function($scope, $rootScope, Groups, $http, API_URL, $q, User, Members, $location) {

      $scope.isMember = function(user, group){
        return ~(group.members.indexOf(user._id));
      }

      $scope.Members = Members;
      $scope._editing = {group:false};

      $scope.save = function(group){
        if(group._newLeader && group._newLeader._id) group.leader = group._newLeader._id;
        group.$save();
        group._editing = false;
      }

      $scope.addWebsite = function(group){
        group.websites.push(group._newWebsite);
        group._newWebsite = '';
      }

      $scope.removeWebsite = function(group, $index){
        group.websites.splice($index,1);
      }

      // ------ Loading ------

      $scope.groups = Groups.groups;
      $scope.fetchGuilds = Groups.fetchGuilds;
      $scope.fetchTavern = Groups.fetchTavern;

      // ------ Modals ------

      $scope.clickMember = function(uid, forceShow) {
        if (User.user._id == uid && !forceShow) {
          if ($location.path() == '/tasks') {
            $location.path('/options');
          } else {
            $location.path('/tasks');
          }
        } else {
          // We need the member information up top here, but then we pass it down to the modal controller
          // down below. Better way of handling this?
          Members.selectMember(uid);
          $rootScope.modals.member = true;
        }
      }

      $scope.removeMember = function(group, member){
        var yes = confirm("Do you really want to remove this member from the party?")
        if(yes){
          group.$removeMember({uuid: member._id}, function(){
            location.reload();
          });
        }
      }

    // ------ Invites ------

      $scope.invitee = '';
      $scope.invite = function(group, uuid){
        group.$invite({uuid:uuid}, function(){
          $scope.invitee = '';
          alert("User invited to group");
        });
      }
    }
  ])

  .controller("MemberModalCtrl", ['$scope', '$rootScope', 'Members',
    function($scope, $rootScope, Members) {
      $scope.timestamp = function(timestamp){
        return moment(timestamp).format('MM/DD/YYYY');
      }
      // We watch Members.selectedMember because it's asynchronously set, so would be a hassle to handle updates here
      $scope.$watch( function() { return Members.selectedMember; }, function (member) {
        $scope.profile = member;
      });
    }
  ])

  .controller('ChatCtrl', ['$scope', 'Groups', 'User', function($scope, Groups, User){
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

    $scope.deleteChatMessage = function(group, message){
      if(message.uuid === User.user.id || (User.user.backer && User.user.backer.admin)){
        group.$deleteChatMessage({messageId: message.id}, function(){
          var i = _.indexOf(group.chat, message);
          if(i !== -1) group.chat.splice(i, 1);
        });
      }
    }

    $scope.sync = function(group){
      group.$get();
    }

    $scope.nameTagClasses = function(message){
      if (!message) return; // fixme what's triggering this?
      if (message.contributor) {
        if (message.contributor.match(/npc/i) || message.contributor.match(/royal/i)) {
          return 'label-royal';
        } else if (message.contributor.match(/champion/i)) {
          return 'label-champion';
        } else if (message.contributor.match(/elite/i)) {
          return 'label-success'; //elite
        }
      }
      if (message.uuid == User.user.id) {
        return 'label-inverse'; //self
      }
    }

  }])

  .controller("GuildsCtrl", ['$scope', 'Groups', 'User', '$rootScope',
    function($scope, Groups, User, $rootScope) {
      $scope.type = 'guild';
      $scope.text = 'Guild';
      $scope.newGroup = new Groups.Group({type:'guild', privacy:'private', leader: User.user._id, members: [User.user._id]});

      $scope.create = function(group){
        if (User.user.balance < 1) return $rootScope.modals.buyGems = true;

        if (confirm("Create Guild for 4 Gems?")) {
          group.$save(function(){
            location.reload();
          });
        }
      }

      $scope.join = function(group){
        // If we're accepting an invitation, we don't have the actual group object, but a faux group object (for performance
        // purposes) {id, name}. Let's trick ngResource into thinking we have a group, so we can call the same $join
        // function (server calls .attachGroup(), which finds group by _id and handles this properly)
        if (group.id && !group._id) {
          group = new Groups.Group({_id:group.id});
        }

        group.$join(function(saved){
          //$scope.groups.guilds.push(saved);
          alert('Joined guild, refresh page to see changes')
        })
      }

      $scope.leave = function(group){
        if (confirm("Are you sure you want to leave this guild?") !== true) {
          return;
        }
        group.$leave();
//        var i = _.find($scope.groups.guilds, {_id:group._id});
//        if (~i) $scope.groups.guilds.splice(i, 1);
        alert('Left guild, refresh page to see changes')
      }

      $scope.reject = function(guild){
        var i = _.findIndex(User.user.invitations.guilds, {id:guild.id});
        if (~i){
          User.user.invitations.guilds.splice(i, 1);
          User.set('invitations.guilds', User.user.invitations.guilds);
        }
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
        group.$join(function(){
          User.user.invitations.party = undefined;
          location.reload();
        });
      }
      $scope.leave = function(group){
        if (confirm("Are you sure you want to leave this party?") !== true) {
          return;
        }
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

  .controller("TavernCtrl", ['$scope', 'Groups', 'User',
    function($scope, Groups, User) {
      $scope.group = Groups.groups.tavern;

      $scope.rest = function(){
        User.user.flags.rest = !User.user.flags.rest;
        User.log({op:'set',data:{'flags.rest':User.user.flags.rest}});
      }
    }
  ])