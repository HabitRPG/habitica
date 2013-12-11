"use strict";

habitrpg.controller("GroupsCtrl", ['$scope', '$rootScope', 'Groups', '$http', 'API_URL', '$q', 'User', 'Members', '$state',
  function($scope, $rootScope, Groups, $http, API_URL, $q, User, Members, $state) {

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

      // ------ Modals ------

      $scope.clickMember = function(uid, forceShow) {
        if (User.user._id == uid && !forceShow) {
          if ($state.is('tasks')) {
            $state.go('options');
          } else {
            $state.go('tasks');
          }
        } else {
          // We need the member information up top here, but then we pass it down to the modal controller
          // down below. Better way of handling this?
          Members.selectMember(uid);
          $rootScope.modals.member = true;
        }
      }

      $scope.removeMember = function(group, member, isMember){
        var yes = confirm("Do you really want to remove this member from the party?")
        if(yes){
          Groups.Group.removeMember({gid: group._id, uuid: member._id }, undefined, function(){
            if(isMember){
              _.pull(group.members, member);
            }else{
              _.pull(group.invites, member);
            }
          });
        }
      }

    // ------ Invites ------

      $scope.invite = function(group){
        Groups.Group.invite({gid: group._id, uuid: group.invitee}, undefined, function(){
          group.invitee = '';
        }, function(){
          group.invitee = '';
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
        if(member)
          member.petCount = $rootScope.Shared.countPets(null, member.items.pets);
        $scope.profile = member;
      });
    }
  ])

  .controller('AutocompleteCtrl', ['$scope', '$timeout', 'Groups', 'User', 'InputCaret', function ($scope,$timeout,Groups,User,InputCaret) {
    $scope.clearUserlist = function() {
      $scope.response = [];
      $scope.usernames = [];
    }
    
    $scope.addNewUser = function(user) {
      if($.inArray(user.user,$scope.usernames) == -1) {
        user.username = user.user;
        $scope.usernames.push(user.user);
        $scope.response.push(user);
      }
    }
    
    $scope.clearUserlist();
    
    $scope.chatChanged = function(newvalue,oldvalue){
      if($scope.group.chat && $scope.group.chat.length > 0){
        for(var i = 0; i < $scope.group.chat.length; i++) {
          $scope.addNewUser($scope.group.chat[i]);
        }
      }
    }
    
    $scope.$watch('group.chat',$scope.chatChanged);
    
    $scope.caretChanged = function(newCaretPos) {
      var relativeelement = $('.-options');
      var textarea = $('.chat-textarea');
      var userlist = $('.list-at-user');
      var offset = {
        x: textarea.offset().left - relativeelement.offset().left,
        y: textarea.offset().top - relativeelement.offset().top,
      };
      if(relativeelement) {
        var caretOffset = InputCaret.getPosition(textarea);
        userlist.css({
                  left: caretOffset.left + offset.x,
                  top: caretOffset.top + offset.y + 16
                });
      }
    }
    
    $scope.updateTimer = false;
    
    $scope.$watch(function () { return $scope.caretPos; },function(newCaretPos) {
      if($scope.updateTimer){
        $timeout.cancel($scope.updateTimer)
      }  
      $scope.updateTimer = $timeout(function(){
        $scope.caretChanged(newCaretPos);
      },$scope.watchDelay)
    });
  }])
  
  .controller('ChatCtrl', ['$scope', 'Groups', 'User', function($scope, Groups, User){
    $scope.message = {content:''};
    $scope._sending = false;
    
    $scope.isUserMentioned = function(user, message) {
      if(message.hasOwnProperty("highlight"))
        return message.highlight;
      message.highlight = false;
      var messagetext = message.text.toLowerCase();
      var username = user.profile.name;
      var mentioned = messagetext.indexOf(username.toLowerCase());
      var pattern = username+"([^\w]|$){1}";
      if(mentioned > -1) {
        var preceedingchar = messagetext.substring(mentioned-1,mentioned);
        if(mentioned == 0 || preceedingchar.trim() == '' || preceedingchar == '@'){
          var regex = new RegExp(pattern,'i');
          message.highlight = regex.test(messagetext);
        }
      }
      return message.highlight;
    }

    $scope.postChat = function(group, message){
      if (_.isEmpty(message) || $scope._sending) return;
      $scope._sending = true;
      var previousMsg = (group.chat && group.chat[0]) ? group.chat[0].id : false;
      Groups.Group.postChat({gid: group._id, message:message, previousMsg: previousMsg}, undefined, function(data){
        if(data.chat){
          group.chat = data.chat;
        }else if(data.message){
          group.chat.unshift(data.message);
        }
        $scope.message.content = '';
        $scope._sending = false;
      }, function(err){
        $scope._sending = false;
      });
    }

    $scope.deleteChatMessage = function(group, message){
      if(message.uuid === User.user.id || (User.user.backer && User.user.contributor.admin)){
        var previousMsg = (group.chat && group.chat[0]) ? group.chat[0].id : false;
        Groups.Group.deleteChatMessage({gid:group._id, messageId:message.id, previousMsg:previousMsg}, undefined, function(data){
          if(data.chat) group.chat = data.chat;

          var i = _.findIndex(group.chat, {id: message.id});
          if(i !== -1) group.chat.splice(i, 1);          
        });
      }
    }

    $scope.sync = function(group){
      group.$get();
    }

    // List of Ordering options for the party members list
    $scope.partyOrderChoices = {
      'level': 'Sort by Level',
      'random': 'Sort randomly',
      'pets': 'Sort by number of pets',
      'party_date_joined': 'Sort by Party date joined',
    };

  }])

  .controller("GuildsCtrl", ['$scope', 'Groups', 'User', '$rootScope', '$state', '$location',
    function($scope, Groups, User, $rootScope, $state, $location) {
      $scope.groups = {
        guilds: Groups.myGuilds(),
        "public": Groups.publicGuilds()
      }
      $scope.type = 'guild';
      $scope.text = 'Guild';
      var newGroup = function(){
        return new Groups.Group({type:'guild', privacy:'private', leader: User.user._id, members: [User.user._id]});
      }
      $scope.newGroup = newGroup()
      $scope.create = function(group){
        if (User.user.balance < 1) return $rootScope.modals.buyGems = true;

        if (confirm("Create Guild for 4 Gems?")) {
          group.$save(function(saved){
            User.user.balance--;
            $scope.groups.guilds.push(saved);
            if(saved.privacy === 'public') $scope.groups.public.push(saved);
            $state.go('options.social.guilds.detail', {gid: saved._id});
            $scope.newGroup = newGroup();
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

        group.$join(function(joined){
          var i = _.findIndex(User.user.invitations.guilds, {id:joined._id});
          if (~i) User.user.invitations.guilds.splice(i,1);
          $scope.groups.guilds.push(joined);
          if(joined.privacy == 'public'){
            joined._isMember = true;
            joined.memberCount++;
          }
          $state.go('options.social.guilds.detail', {gid: joined._id});
        })
      }

      $scope.leave = function(group){
        if (confirm("Are you sure you want to leave this guild?") !== true) {
          return;
        }
        Groups.Group.leave({gid: group._id}, undefined, function(){
          $scope.groups.guilds.splice(_.indexOf($scope.groups.guilds, group), 1);
          // remove user from group members if guild is public so that he can re-join it immediately
          if(group.privacy == 'public' || !group.privacy){ //public guilds with only some fields fetched
            var i = _.findIndex($scope.groups.public, {_id: group._id});
            if(~i){
              var guild = $scope.groups.public[i];
              guild.memberCount--;
              guild._isMember = false;
            }
          }
          $state.go('options.social.guilds');
        });
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

  .controller("PartyCtrl", ['$scope', 'Groups', 'User', '$state',
    function($scope, Groups, User, $state) {
      $scope.type = 'party';
      $scope.text = 'Party';
      $scope.group = Groups.party();
      $scope.newGroup = new Groups.Group({type:'party', leader: User.user._id, members: [User.user._id]});
      $scope.create = function(group){
        group.$save(function(newGroup){
          $scope.group = newGroup;
        });
      }

      $scope.join = function(party){
        var group = new Groups.Group({_id: party.id, name: party.name});
        // there a better way to access GroupsCtrl.groups.party?
        group.$join(function(groupJoined){
          $scope.group = groupJoined;
        });
      }

      $scope.leave = function(group){
        if (confirm("Are you sure you want to leave this party?") !== true) {
          return;
        }
        Groups.Group.leave({gid: group._id}, undefined, function(){
          $scope.group = undefined;
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
      $scope.group = Groups.tavern();
      $scope.rest = function(){
        User.user.flags.rest = !User.user.flags.rest;
        User.log({op:'set',data:{'flags.rest':User.user.flags.rest}});
      }
      $scope.toggleUserTier = function($event) {
        $($event.target).next().toggle();
      }
    }
  ])
