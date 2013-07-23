'use strict';
// Make user and settings available for everyone through root scope.
habitrpg.controller( 'RootCtrl', function ( $scope, $rootScope, User) {
    $rootScope.User = User;
    $rootScope.user = User.user;
    $rootScope.settings = User.settings;

});
