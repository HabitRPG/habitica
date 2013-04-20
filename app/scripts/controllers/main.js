'use strict';

angular.module('websiteAngularApp')
  .controller('MainCtrl', function ($scope, $rootScope, User) {
    $rootScope.isProduction = false;
    $rootScope.user = User.get();
    $rootScope.username = User.username;
    $rootScope.loggedIn = !!$rootScope.user.auth.local || !!$rootScope.user.auth.facebook;

  });
