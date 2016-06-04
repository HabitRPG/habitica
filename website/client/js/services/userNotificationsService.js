'use strict';

angular.module('habitrpg')
.factory('UserNotifications',  ['$http',
  function userNotificationsFactory($http) {

    function readNotification (notificationId) {
      return $http({
        method: 'POST',
        url: 'api/v3/notifications/' + notificationId + '/read',
      });
    };

    return {
      readNotification: readNotification,
    };
  }]);
