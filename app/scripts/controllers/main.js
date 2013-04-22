'use strict';

angular.module('habitRPG')
  .controller('MainCtrl', function ($scope, $rootScope, User, Helpers) {
    _.defaults($rootScope, Helpers);
    $rootScope.isProduction = false;
    $rootScope.user = User.get();
    $rootScope.loggedIn = !!$rootScope.user.auth.local || !!$rootScope.user.auth.facebook;

  });
