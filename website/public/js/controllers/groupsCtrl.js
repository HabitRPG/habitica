"use strict";

habitrpg.controller("GroupsCtrl", ['$scope', '$rootScope', 'Shared', 'Groups', '$http', '$q', 'User', 'Members', '$state', 'Notification',
  function($scope, $rootScope, Shared, Groups, $http, $q, User, Members, $state, Notification) {

    $scope.isMemberOfPendingQuest = function(userid, group) {
      if (!group.quest || !group.quest.members) return false;
      if (group.quest.active) return false; // quest is started, not pending
      return userid in group.quest.members && group.quest.members[userid] != false;
    }

    $scope.isMemberOfRunningQuest = function(userid, group) {
      if (!group.quest || !group.quest.members) return false;
      if (!group.quest.active) return false; // quest is pending, not started
      return group.quest.members[userid];
    }

    $scope.isMemberOfGroup = function(userid, group){

      // If the group is a guild, just check for an intersection with the
      // current user's guilds, rather than checking the members of the group.
      if(group.type === 'guild') {
        return _.detect(Groups.myGuilds(), function(g) { return g._id === group._id });
      }

      // Similarly, if we're dealing with the user's current party, return true.
      if(group.type === 'party') {
        var currentParty = Groups.party();
        if(currentParty._id && currentParty._id === group._id) return true;
      }

      if (!group.members) return false;
      var memberIds = _.map(group.members, function(x){return x._id});
      return ~(memberIds.indexOf(userid));
    }

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

    $scope.deleteAllMessages = function() {
      if (confirm(window.env.t('confirmDeleteAllMessages'))) {
        User.user.ops.clearPMs({});
      }
    }

    // ------ Modals ------

    $scope.clickMember = function(uid, forceShow) {
      if (User.user._id == uid && !forceShow) {
        if ($state.is('tasks')) {
          $state.go('options.profile.avatar');
        } else {
          $state.go('tasks');
        }
      } else {
        // We need the member information up top here, but then we pass it down to the modal controller
        // down below. Better way of handling this?
        Members.selectMember(uid, function(){
          $rootScope.openModal('member', {controller:'MemberModalCtrl', windowClass:'profile-modal', size:'lg'});
        });
      }
    }


    $scope.removeMember = function(group, member, isMember){
      // TODO find a better way to do this (share data with remove member modal)
      $scope.removeMemberData = {
        group: group,
        member: member,
        isMember: isMember
      };
      $rootScope.openModal('remove-member', {scope: $scope});
    }

    $scope.confirmRemoveMember = function(confirm){
      if(confirm){
        Groups.Group.removeMember({
          gid: $scope.removeMemberData.group._id,
          uuid: $scope.removeMemberData.member._id,
          message: $scope.removeMemberData.message,
        }, undefined, function(){
          if($scope.removeMemberData.isMember){
            _.pull($scope.removeMemberData.group.members, $scope.removeMemberData.member);
          }else{
            _.pull($scope.removeMemberData.group.invites, $scope.removeMemberData.member);
          }

          $scope.removeMemberData = undefined;
        });
      }else{
        $scope.removeMemberData = undefined;
      }
    }

    $scope.openInviteModal = function(group){
      $rootScope.openModal('invite-friends', {controller:'InviteToGroupCtrl', resolve:
        {injectedGroup: function(){
          return group;
        }}});
    };

    //var serializeQs = function(obj, prefix){
    //  var str = [];
    //  for(var p in obj) {
    //    if (obj.hasOwnProperty(p)) {
    //      var k = prefix ? prefix + "[" + p + "]" : p, v = obj[p];
    //      str.push(typeof v == "object" ?
    //        serializeQs(v, k) :
    //        encodeURIComponent(k) + "=" + encodeURIComponent(v));
    //    }
    //  }
    //  return str.join("&");
    //}
    //
    //$scope.inviteLink = function(obj){
    //  return window.env.BASE_URL + '?' + serializeQs({partyInvite: obj});
    //}

    $scope.quickReply = function(uid) {
      Members.selectMember(uid, function(){
        $rootScope.openModal('private-message',{controller:'MemberModalCtrl'});
      });
    }

  }])

  .controller('InviteToGroupCtrl', ['$scope', 'User', 'Groups', 'injectedGroup', '$http', 'Notification', function($scope, User, Groups, injectedGroup, $http, Notification){
    $scope.group = injectedGroup;

    $scope.inviter = User.user.profile.name;
    $scope.emails = [{name:"",email:""},{name:"",email:""}];

    $scope.inviteEmails = function(){
      Groups.Group.invite({gid: $scope.group._id}, {inviter: $scope.inviter, emails: $scope.emails}, function(){
        Notification.text("Invitation(s) sent!");
        $scope.emails = [{name:'',email:''},{name:'',email:''}];
      }, function(){
        $scope.emails = [{name:'',email:''},{name:'',email:''}];
      });
    };

    $scope.invite = function(){
      Groups.Group.invite({gid: $scope.group._id}, {uuids: [$scope.invitee]}, function(){
        Notification.text("Invitation(s) sent!");
        $scope.invitee = '';
      }, function(){
        $scope.invitee = '';
      });
    };
  }])

  .controller("MemberModalCtrl", ['$scope', '$rootScope', 'Members', 'Shared', '$http', 'Notification', 'Groups', '$controller',
    function($scope, $rootScope, Members, Shared, $http, Notification, Groups, $controller) {

      $controller('RootCtrl', {$scope: $scope});

      $scope.timestamp = function(timestamp){
        return moment(timestamp).format($rootScope.User.user.preferences.dateFormat.toUpperCase());
      }
      // We watch Members.selectedMember because it's asynchronously set, so would be a hassle to handle updates here
      $scope.$watch( function() { return Members.selectedMember; }, function (member) {
        if(member)
          member.petCount = Shared.countPets($rootScope.countExists(member.items.pets), member.items.pets);
          member.mountCount = Shared.countMounts($rootScope.countExists(member.items.mounts), member.items.mounts);
        $scope.profile = member;
      });
      $scope.sendPrivateMessage = function(uuid, message){
        // Don't do anything if the user somehow gets here without a message.
        if (!message) return;

        $http.post('/api/v2/members/'+uuid+'/message',{message:message}).success(function(){
          Notification.text(window.env.t('messageSentAlert'));
          $rootScope.User.sync();
          $scope.$close();
        });
      }
      $scope.gift = {
        type: 'gems',
        gems: {amount:0, fromBalance:true},
        subscription: {key:''},
        message:''
      };
      $scope.sendGift = function(uuid, gift){
        $http.post('/api/v2/members/'+uuid+'/gift', gift).success(function(){
          Notification.text('Gift sent!')
          $rootScope.User.sync();
          $scope.$close();
        })
      }
      $scope.reportAbuse = function(reporter, message, groupId) {
        message.flags[reporter._id] = true;
        Groups.Group.flagChatMessage({gid: groupId, messageId: message.id}, undefined, function(data){
          Notification.text(window.env.t('abuseReported'));
          $scope.$close();
        });
      }
      $scope.clearFlagCount = function(message, groupId) {
        Groups.Group.clearFlagCount({gid: groupId, messageId: message.id}, undefined, function(data){
          message.flagCount = 0;
          Notification.text("Flags cleared");
          $scope.$close();
        });
      }
    }
  ])

  .controller('AutocompleteCtrl', ['$scope', '$timeout', 'Groups', 'User', 'InputCaret', function ($scope,$timeout,Groups,User,InputCaret) {
    $scope.clearUserlist = function() {
      $scope.response = [];
      $scope.usernames = [];
    }

    $scope.filterUser = function(msg) {
      if ($scope.query === undefined || $scope.query === null) {
        return false;
      }
      return msg.user.indexOf($scope.query.text) == 0; // query should be prefix of msg.user
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
      var relativeelement = $('.chat-form div:first');
      var textarea = $('.chat-form textarea');
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

  .controller('ChatCtrl', ['$scope', 'Groups', 'User', '$http', 'ApiUrl', 'Notification', 'Members', '$rootScope', function($scope, Groups, User, $http, ApiUrl, Notification, Members, $rootScope){
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
        if(confirm('Are you sure you want to delete this message?')){
          Groups.Group.deleteChatMessage({gid:group._id, messageId:message.id, previousMsg:previousMsg}, undefined, function(data){
            if(data.chat) group.chat = data.chat;

            var i = _.findIndex(group.chat, {id: message.id});
            if(i !== -1) group.chat.splice(i, 1);
          });
        }
      }
    }

    $scope.likeChatMessage = function(group,message) {
      if (message.uuid == User.user._id)
        return Notification.text(window.env.t('foreverAlone'));
      if (!message.likes) message.likes = {};
      if (message.likes[User.user._id]) {
        delete message.likes[User.user._id];
      } else {
        message.likes[User.user._id] = true;
      }
      //Chat.Chat.like({gid:group._id,mid:message.id});

      $http.post(ApiUrl.get() + '/api/v2/groups/' + group._id + '/chat/' + message.id + '/like');
    }

    $scope.flagChatMessage = function(groupId,message) {
      if(!message.flags) message.flags = {};
      if(message.flags[User.user._id])
        Notification.text(window.env.t('abuseAlreadyReported'));
      else {
        $scope.abuseObject = message;
        $scope.groupId = groupId;
        Members.selectMember(message.uuid, function(){
          $rootScope.openModal('abuse-flag',{
            controller:'MemberModalCtrl',
            scope: $scope
          });
        });
      }
    }

    $scope.sync = function(group){
      group.$get();
      //When the user clicks fetch recent messages we need to update that the user has seen the new messages
      Groups.seenMessage(group._id);
    }

    // List of Ordering options for the party members list
    $scope.partyOrderChoices = {
      'level': window.env.t('sortLevel'),
      'random': window.env.t('sortRandom'),
      'pets': window.env.t('sortPets'),
      'habitrpg_date_joined' : window.env.t('sortHabitrpgJoined'),
      'party_date_joined': window.env.t('sortJoined'),
      'habitrpg_last_logged_in': window.env.t('sortHabitrpgLastLoggedIn'),
      'name': window.env.t('sortName'),
      'backgrounds': window.env.t('sortBackgrounds'),
    };

    $scope.partyOrderAscendingChoices = {
      'ascending': window.env.t('ascendingSort'),
      'descending': window.env.t('descendingSort')
    }

  }])

  .controller("GuildsCtrl", ['$scope', 'Groups', 'User', 'Challenges', '$rootScope', '$state', '$location', '$compile',
    function($scope, Groups, User, Challenges, $rootScope, $state, $location, $compile) {
      $scope.groups = {
        guilds: Groups.myGuilds(),
        "public": Groups.publicGuilds()
      }

      $scope.type = 'guild';
      $scope.text = window.env.t('guild');
      var newGroup = function(){
        return new Groups.Group({type:'guild', privacy:'private'});
      }
      $scope.newGroup = newGroup()
      $scope.create = function(group){
        if (User.user.balance < 1)
          return $rootScope.openModal('buyGems', {track:"Gems > Create Group"});

        if (confirm(window.env.t('confirmGuild'))) {
          group.$save(function(saved){
            $rootScope.hardRedirect('/#/options/groups/guilds/' + saved._id);
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
          $rootScope.hardRedirect('/#/options/groups/guilds/' + joined._id);
        })
      }

      $scope.leave = function(keep) {
         if (keep == 'cancel') {
           $scope.selectedGroup = undefined;
           $scope.popoverEl.popover('destroy');
         } else {
           Groups.Group.leave({gid: $scope.selectedGroup._id, keep:keep}, undefined, function(){
             $rootScope.hardRedirect('/#/options/groups/guilds');
           });
         }
      }

      $scope.clickLeave = function(group, $event){
          $scope.selectedGroup = group;
          $scope.popoverEl = $($event.target);
          var html, title;
          Challenges.Challenge.query(function(challenges) {
              challenges = _.pluck(_.filter(challenges, function(c) {
                  return c.group._id == group._id;
              }), '_id');
              if (_.intersection(challenges, User.user.challenges).length > 0) {
                  html = $compile(
              '<a ng-controller="GroupsCtrl" ng-click="leave(\'remove-all\')">' + window.env.t('removeTasks') + '</a><br/>\n<a ng-click="leave(\'keep-all\')">' + window.env.t('keepTasks') + '</a><br/>\n<a ng-click="leave(\'cancel\')">' + window.env.t('cancel') + '</a><br/>'
          )($scope);
                  title = window.env.t('leaveGroupCha');
              } else {
                  html = $compile(
                      '<a ng-controller="GroupsCtrl" ng-click="leave(\'keep-all\')">' + window.env.t('confirm') + '</a><br/>\n<a ng-click="leave(\'cancel\')">' + window.env.t('cancel') + '</a><br/>'
                  )($scope);
                  title = window.env.t('leaveGroup')
              }
          $scope.popoverEl.popover('destroy').popover({
              html: true,
              placement: 'top',
              trigger: 'manual',
                  title: title,
              content: html
          }).popover('show');
          });
      }

      $scope.reject = function(guild){
        var i = _.findIndex(User.user.invitations.guilds, {id:guild.id});
        if (~i){
          User.user.invitations.guilds.splice(i, 1);
          User.set({'invitations.guilds':User.user.invitations.guilds});
        }
      }
    }
  ])

  .controller("PartyCtrl", ['$rootScope','$scope', 'Groups', 'User', 'Challenges', '$state', '$compile',
    function($rootScope,$scope, Groups, User, Challenges, $state, $compile) {
      $scope.type = 'party';
      $scope.text = window.env.t('party');
      $scope.group = $rootScope.party = Groups.party();
      $scope.newGroup = new Groups.Group({type:'party'});

      Groups.seenMessage($scope.group._id);

      $scope.create = function(group){
        group.$save(function(){
          $rootScope.hardRedirect('/#/options/groups/party');
        });
      }

      $scope.join = function(party){
        var group = new Groups.Group({_id: party.id, name: party.name});
        group.$join(function(){
          $rootScope.hardRedirect('/#/options/groups/party');
        });
      }

      // TODO: refactor guild and party leave into one function
      $scope.leave = function(keep) {
        if (keep == 'cancel') {
          $scope.selectedGroup = undefined;
          $scope.popoverEl.popover('destroy');
        } else {
          Groups.Group.leave({gid: $scope.selectedGroup._id, keep:keep}, undefined, function(){
            $rootScope.hardRedirect('/#/options/groups/party');
          });
        }
      }

      // TODO: refactor guild and party clickLeave into one function
      $scope.clickLeave = function(group, $event){
          $scope.selectedGroup = group;
          $scope.popoverEl = $($event.target);
          var html, title;
          Challenges.Challenge.query(function(challenges) {
              challenges = _.pluck(_.filter(challenges, function(c) {
                  return c.group._id == group._id;
              }), '_id');
              if (_.intersection(challenges, User.user.challenges).length > 0) {
                  html = $compile(
              '<a ng-controller="GroupsCtrl" ng-click="leave(\'remove-all\')">' + window.env.t('removeTasks') + '</a><br/>\n<a ng-click="leave(\'keep-all\')">' + window.env.t('keepTasks') + '</a><br/>\n<a ng-click="leave(\'cancel\')">' + window.env.t('cancel') + '</a><br/>'
          )($scope);
                  title = window.env.t('leavePartyCha');
              } else {
                  html = $compile(
                      '<a ng-controller="GroupsCtrl" ng-click="leave(\'keep-all\')">' + window.env.t('confirm') + '</a><br/>\n<a ng-click="leave(\'cancel\')">' + window.env.t('cancel') + '</a><br/>'
                  )($scope);
                  title = window.env.t('leaveParty');
              }
          $scope.popoverEl.popover('destroy').popover({
              html: true,
              placement: 'top',
              trigger: 'manual',
                  title: title,
              content: html
          }).popover('show');
          });
      }

      $scope.reject = function(){
        //User.user.invitations.party = undefined;
        User.set({'invitations.party':{}});
      }

      $scope.questCancel = function(){
        if (!confirm(window.env.t('sureCancel'))) return;
        $rootScope.party.$questCancel();
      }

      $scope.questAbort = function(){
        if (!confirm(window.env.t('sureAbort'))) return;
        if (!confirm(window.env.t('doubleSureAbort'))) return;
        $rootScope.party.$questAbort();
      }

    }
  ])

  .controller("TavernCtrl", ['$scope', 'Groups', 'User',
    function($scope, Groups, User) {
      $scope.group = Groups.tavern();
      $scope.toggleUserTier = function($event) {
        $($event.target).next().toggle();
      }
    }
  ])
