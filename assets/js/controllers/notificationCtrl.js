'use strict';

habitrpg.controller('NotificationCtrl',
  ['$scope', 'Notification',
  function ($scope, Notification) {
    $scope.data = Notification.get();

  }
]);
