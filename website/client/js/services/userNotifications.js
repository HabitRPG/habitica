'use strict';

angular.module('habitrpg')
.factory('UserNotifications',  ['$http',
  function userNotificationsFactory($http) {

    function addNotification (notificationDetails) {
      return $http({
        method: 'POST',
        url: 'api/v3/notifications',
        data: notificationDetails,
      });
    }

    function readNotification (notificationId) {
      return $http({
        method: 'POST',
        url: 'api/v3/notifications/' + notificationId,
      });
    };

    return {
      addNotification: addNotification,
      readNotification: readNotification,
    };
  }]);
