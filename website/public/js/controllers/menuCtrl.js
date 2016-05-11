'use strict';

angular.module('habitrpg')
  .controller('MenuCtrl', ['$scope', '$rootScope', '$http', 'Chat',
    function($scope, $rootScope, $http, Chat) {

      $scope.logout = function() {
        localStorage.clear();
        window.location.href = '/logout';
      };

      function selectNotificationValue(mysteryValue, invitationValue, cardValue, unallocatedValue, messageValue, noneValue) {
        var user = $scope.user;
        if (user.purchased && user.purchased.plan && user.purchased.plan.mysteryItems && user.purchased.plan.mysteryItems.length) {
          return mysteryValue;
        } else if ((user.invitations.party && user.invitations.party.id) || (user.invitations.guilds && user.invitations.guilds.length > 0)) {
          return invitationValue;
        } else if (user.flags.cardReceived) {
          return cardValue;
        } else if (user.flags.classSelected && !(user.preferences && user.preferences.disableClasses) && user.stats.points) {
          return unallocatedValue;
        } else if (!(_.isEmpty(user.newMessages))) {
          return messageValue;
        } else {
          return noneValue;
        }
      }

      $scope.clearMessages = Chat.markChatSeen;
      $scope.clearCards = Chat.clearCards;

      $scope.iconClasses = function() {
        return selectNotificationValue(
          'glyphicon-gift',
          'glyphicon-user',
          'glyphicon-envelope',
          'glyphicon-plus-sign',
          'glyphicon-comment',
          'glyphicon-comment inactive'
        );
      };

      $scope.hasNoNotifications = function() {
        return selectNotificationValue(false, false, false, false, false, true);
      }
    }
]);
