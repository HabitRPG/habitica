'use strict';

angular.module('habitrpg')
.factory('Chat', ['$http', 'ApiUrl', 'User', '$rootScope',
  function($http, ApiUrl, User, $rootScope) {
    var apiV3Prefix = '/api/v3';

    function getChat (groupId) {
      return $http({
        method: 'GET',
        url: apiV3Prefix + '/groups/' + groupId + '/chat',
      });
    }

    function postChat (groupId, message, previousMsg) {
      var url = apiV3Prefix + '/groups/' + groupId + '/chat';

      if (previousMsg) {
        url += '?previousMsg=' + previousMsg;
      }

      return $http({
        method: 'POST',
        url: url,
        data: {
          message: message,
          pusherSocketId: $rootScope.pusherSocketId, // to make sure the send doesn't get notified of it's own message
        }
      });
    }

    function deleteChat (groupId, chatId, previousMsg) {
      var url = apiV3Prefix + '/groups/' + groupId + '/chat/' + chatId;

      if (previousMsg) {
        url += '?previousMsg=' + previousMsg;
      }

      return $http({
        method: 'DELETE',
        url: url,
      });
    }

    function like (groupId, chatId) {
      return $http({
        method: 'POST',
        url: apiV3Prefix + '/groups/' + groupId + '/chat/' + chatId + '/like',
      });
    }

    function flagChatMessage (groupId, chatId) {
      return $http({
        method: 'POST',
        url: apiV3Prefix + '/groups/' + groupId + '/chat/' + chatId + '/flag',
      });
    }

    function clearFlagCount (groupId, chatId) {
      return $http({
        method: 'POST',
        url: apiV3Prefix + '/groups/' + groupId + '/chat/' + chatId + '/clearflags',
      });
    }

    function markChatSeen (groupId) {
      if (User.user.newMessages) delete User.user.newMessages[groupId];
      return $http({
        method: 'POST',
        url: apiV3Prefix + '/groups/' + groupId + '/chat/seen',
      });
    }

    function clearCards () {
      User.user._wrapped && User.set({'flags.cardReceived':false});
    }

    return {
      getChat: getChat,
      postChat: postChat,
      deleteChat: deleteChat,
      like: like,
      flagChatMessage: flagChatMessage,
      clearFlagCount: clearFlagCount,
      markChatSeen: markChatSeen,
      clearCards: clearCards,
    }
  }]);
