'use strict';


habitrpg.controller('NotificationCtrl', function ($scope, $location, filterFilter, Notification) {
    $scope.data = Notification.get();

    $('#notification').bind('touchend.swipe', function (event) {
        Notification.clearTimer();
        Notification.hide();
    });


});
