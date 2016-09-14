'use strict';

angular.module('habitrpg')
.factory('Members', [ '$rootScope', 'Shared', 'ApiUrl', '$http', '$q',
  function($rootScope, Shared, ApiUrl, $http, $q) {
    var members = {};
    var selectedMember = {};
    var apiV3Prefix = '/api/v3';

    function fetchMember (memberId) {
      return $http({
        method: 'GET',
        url: apiV3Prefix + '/members/' + memberId,
      });
    }

    //@TODO: Add paging
    function getGroupMembers (groupId, includeAllPublicFields) {
      var url = apiV3Prefix + '/groups/' + groupId + '/members';

      if (includeAllPublicFields) {
        url += '?includeAllPublicFields=true';
      }

      return $http({
        method: 'GET',
        url: url,
      });
    }

    function getGroupInvites (groupId) {
      return $http({
        method: 'GET',
        url: apiV3Prefix + '/groups/' + groupId + '/invites',
      });
    }

    function getChallengeMembers (challengeId) {
      return $http({
        method: 'GET',
        url: apiV3Prefix + '/challenges/' + challengeId + '/members?includeAllMembers=true',
      });
    }

    function getChallengeMemberProgress (challengeId, memberId) {
      return $http({
        method: 'GET',
        url: apiV3Prefix + '/challenges/' + challengeId + '/members/' + memberId,
      });
    }

    function sendPrivateMessage (message, toUserId) {
      return $http({
        method: 'POST',
        url: apiV3Prefix + '/members/send-private-message',
        data: {
          message: message,
          toUserId: toUserId,
        }
      });
    }

    function transferGems (message, toUserId, gemAmount) {
      return $http({
        method: 'POST',
        url: apiV3Prefix + '/members/transfer-gems',
        data: {
          message: message,
          toUserId: toUserId,
          gemAmount: gemAmount,
        }
      });
    }

    function selectMember (uid) {
      var self = this;
      var deferred = $q.defer();
      var memberIsReady = _checkIfMemberIsReady(members[uid]);

      if (memberIsReady) {
        _prepareMember(members[uid], self);
        deferred.resolve();
      } else {
        fetchMember(uid)
          .then(function (response) {
            var member = response.data.data;
            addToMembersList(member); // lazy load for later
            _prepareMember(member, self);
            deferred.resolve();
          });
      }

      return deferred.promise;
    }

    function addToMembersList (member) {
      if (member._id) {
        members[member._id] = member;
      }
    }

    function _checkIfMemberIsReady (member) {
      return member && member.items && member.items.weapon;
    }

    function _prepareMember(member, self) {
      Shared.wrap(member, false);
      self.selectedMember = members[member._id];
    }

    $rootScope.$on('userUpdated', function(event, user){
      addToMembersList(user);
    })

    return {
      members: members,
      addToMembersList: addToMembersList,
      selectedMember: undefined,
      selectMember: selectMember,
      fetchMember: fetchMember,
      getGroupMembers: getGroupMembers,
      getGroupInvites: getGroupInvites,
      getChallengeMembers: getChallengeMembers,
      getChallengeMemberProgress: getChallengeMemberProgress,
      sendPrivateMessage: sendPrivateMessage,
      transferGems: transferGems,
    }
 }]);
