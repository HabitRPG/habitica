"use strict";

window.habitrpg = angular.module('habitrpg',
    ['ngRoute', 'ngResource', 'userServices', 'groupServices', 'sharedServices', 'authServices', 'notificationServices', 'ui.bootstrap', 'ui.keypress'])

  .constant("API_URL", "")
  .constant("STORAGE_USER_ID", 'habitrpg-user')
  .constant("STORAGE_SETTINGS_ID", 'habit-mobile-settings')
  //.constant("STORAGE_GROUPS_ID", "") // if we decide to take groups offline

  .config(['$routeProvider', '$httpProvider', 'STORAGE_SETTINGS_ID',
    function($routeProvider, $httpProvider, STORAGE_SETTINGS_ID) {
      $routeProvider
        //.when('/login', {templateUrl: 'views/login.html'})
        .when('/tasks',   {templateUrl: 'partials/tasks'})
        .when('/options', {templateUrl: 'partials/options'})

        .otherwise({redirectTo: '/tasks'});

      var settings = JSON.parse(localStorage.getItem(STORAGE_SETTINGS_ID));
      if (settings && settings.auth) {
        $httpProvider.defaults.headers.common['Content-Type'] = 'application/json;charset=utf-8';
        $httpProvider.defaults.headers.common['x-api-user'] = settings.auth.apiId;
        $httpProvider.defaults.headers.common['x-api-key'] = settings.auth.apiId;
      }
  }])