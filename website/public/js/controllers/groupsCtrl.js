"use strict";

habitrpg.controller("GroupsCtrl", ['$scope', '$rootScope', 'Shared', 'Groups', '$http', '$q', 'User', 'Members', '$state', 'Notification',
  function($scope, $rootScope, Shared, Groups, $http, $q, User, Members, $state, Notification) {

    $scope.isMemberOfPendingQuest = function(userid, group) {
      if (!group.quest || !group.quest.members) return false;
      if (group.quest.active) return false; // quest is started, not pending
      return userid in group.quest.members && group.quest.members[userid] != false;
    };

    $scope.isMemberOfRunningQuest = function(userid, group) {
      if (!group.quest || !group.quest.members) return false;
      if (!group.quest.active) return false; // quest is pending, not started
      return group.quest.members[userid];
    };

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
    };

    $scope.isMember = function(user, group){
      return ~(group.members.indexOf(user._id));
    };

    $scope.Members = Members;
    $scope._editing = {group:false};

    $scope.save = function(group){
      if(group._newLeader && group._newLeader._id) group.leader = group._newLeader._id;
      group.$save();
      group._editing = false;
    };

    $scope.deleteAllMessages = function() {
      if (confirm(window.env.t('confirmDeleteAllMessages'))) {
        User.user.ops.clearPMs({});
      }
    };

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
    };


    $scope.removeMember = function(group, member, isMember){
      // TODO find a better way to do this (share data with remove member modal)
      $scope.removeMemberData = {
        group: group,
        member: member,
        isMember: isMember
      };
      $rootScope.openModal('remove-member', {scope: $scope});
    };

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
    };

    $scope.openInviteModal = function(group){
      if (group.type !== 'party' && group.type !== 'guild') {
        return console.log('Invalid group type.')
      }
      $rootScope.openModal('invite-' + group.type, {
        controller:'InviteToGroupCtrl',
        resolve: {
          injectedGroup: function(){
            return group;
          }
        }
      });
    };

    $scope.quickReply = function(uid) {
      Members.selectMember(uid, function(){
        $rootScope.openModal('private-message',{controller:'MemberModalCtrl'});
      });
    }

  }]);
