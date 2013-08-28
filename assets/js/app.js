"use strict";

window.habitrpg = angular.module('habitrpg', ['ngRoute', 'userServices', 'sharedServices', 'authServices', 'notificationServices', 'ui.bootstrap'])
  .constant("API_URL", "")
  .config(['$routeProvider', function($routeProvider) {
    $routeProvider
      //.when('/login', {templateUrl: 'views/login.html'})
      .when('/tasks',   {templateUrl: 'partials/tasks'})
      .when('/options', {templateUrl: 'partials/options'})

      .otherwise({redirectTo: '/tasks'});
  }])
