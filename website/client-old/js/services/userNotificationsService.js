'use strict';

angular.module('habitrpg')
.factory('UserNotifications',  ['$http',
  function userNotificationsFactory($http) {

    var lastRead; // keep track of last notification ID to avoid reding it twice

    function readNotification (notificationId) {
      if (lastRead === notificationId) return;
      lastRead = notificationId;

      return $http({
        method: 'POST',
        url: 'api/v3/notifications/' + notificationId + '/read',
      });
    };

    return {
      readNotification: readNotification,
    };
  }]);
