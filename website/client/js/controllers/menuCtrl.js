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

      $scope.getNotificationsCount = function() {
        var count = 0;

        if($scope.user.invitations.party && $scope.user.invitations.party.id){
          count++;
        }

        if($scope.user.purchased.plan && $scope.user.purchased.plan.mysteryItems.length){
          count++;
        }

        if($scope.user.invitations.guilds){
          count += $scope.user.invitations.guilds.length;
        }

        if($scope.user.flags.classSelected && !$scope.user.preferences.disableClasses && $scope.user.stats.points){
          count += $scope.user.stats.points > 0 ? 1 : 0;
        }

        if($scope.user.newMessages) {
          count += Object.keys($scope.user.newMessages).length;
        }

        return count;
      };

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
