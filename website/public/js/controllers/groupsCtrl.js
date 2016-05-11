"use strict";

habitrpg.controller("GroupsCtrl", ['$scope', '$rootScope', 'Shared', 'Groups', '$http', '$q', 'User', 'Members', '$state', 'Notification',
  function($scope, $rootScope, Shared, Groups, $http, $q, User, Members, $state, Notification) {
    $scope.isMemberOfPendingQuest = function (userid, group) {
      if (!group.quest || !group.quest.members) return false;
      if (group.quest.active) return false; // quest is started, not pending
      return userid in group.quest.members && group.quest.members[userid] != false;
    };

    $scope.isMemberOfRunningQuest = function (userid, group) {
      if (!group.quest || !group.quest.members) return false;
      if (!group.quest.active) return false; // quest is pending, not started
      return group.quest.members[userid];
    };

    $scope.isMemberOfGroup = function (userid, group) {
      // If the group is a guild, just check for an intersection with the
      // current user's guilds, rather than checking the members of the group.
      if(group.type === 'guild') {
        return _.detect(User.user.guilds, function(guildId) { return guildId === group._id });
      }

      // Similarly, if we're dealing with the user's current party, return true.
      if(group.type === 'party') {
        var currentParty = group;
        if(currentParty._id && currentParty._id === group._id) return true;
      }

      if (!group.members) return false;
      var memberIds = _.map(group.members, function(x){return x._id});
      return ~(memberIds.indexOf(userid));
    };

    $scope.isMember = function (user, group) {
      return ~(group.members.indexOf(user._id));
    };

    $scope.Members = Members;

    $scope._editing = {group: false};
    $scope.groupCopy = {};

    $scope.editGroup = function (group) {
      angular.copy(group, $scope.groupCopy);
      group._editing = true;
    };

    $scope.saveEdit = function (group) {
      var newLeader = $scope.groupCopy._newLeader && $scope.groupCopy._newLeader._id;

      if (newLeader) {
        $scope.groupCopy.leader = newLeader;
      }

      angular.copy($scope.groupCopy, group);

      Groups.Group.update(group);

      $scope.cancelEdit(group);
    };

    $scope.cancelEdit = function (group) {
      group._editing = false;
      $scope.groupCopy = {};
    };

    $scope.deleteAllMessages = function() {
      if (confirm(window.env.t('confirmDeleteAllMessages'))) {
        User.clearPMs();
      }
    };

    // ------ Modals ------

    $scope.clickMember = function (uid, forceShow) {
      if (User.user._id == uid && !forceShow) {
        if ($state.is('tasks')) {
          $state.go('options.profile.avatar');
        } else {
          $state.go('tasks');
        }
      } else {
        // We need the member information up top here, but then we pass it down to the modal controller
        // down below. Better way of handling this?
        Members.selectMember(uid)
          .then(function () {
            $rootScope.openModal('member', {controller: 'MemberModalCtrl', windowClass: 'profile-modal', size: 'lg'});
          });
      }
    };

    $scope.removeMember = function (group, member, isMember) {
      // TODO find a better way to do this (share data with remove member modal)
      $scope.removeMemberData = {
        group: group,
        member: member,
        isMember: isMember
      };
      $rootScope.openModal('remove-member', {scope: $scope});
    };

    $scope.confirmRemoveMember = function (confirm) {
      if (confirm) {
        Groups.Group.removeMember(
          $scope.removeMemberData.group._id,
          $scope.removeMemberData.member._id,
          $scope.removeMemberData.message
        ).then(function (response) {
          if($scope.removeMemberData.isMember){
            _.pull($scope.removeMemberData.group.members, $scope.removeMemberData.member);
          }else{
            _.pull($scope.removeMemberData.group.invites, $scope.removeMemberData.member);
          }

          $scope.removeMemberData = undefined;
        });
      } else {
        $scope.removeMemberData = undefined;
      }
    };

    $scope.openInviteModal = function (group) {
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

    $scope.quickReply = function (uid) {
      Members.selectMember(uid)
        .then(function (response) {
          $rootScope.openModal('private-message', {controller: 'MemberModalCtrl'});
        });
    }
  }]);
