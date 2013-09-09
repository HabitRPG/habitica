"use strict";

window.habitrpg = angular.module('habitrpg',
    ['ngRoute', 'ngResource', 'ngSanitize', 'userServices', 'groupServices', 'memberServices', 'sharedServices', 'authServices', 'notificationServices', 'ui.bootstrap', 'ui.keypress', 'btford.markdown'])

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
        $httpProvider.defaults.headers.common['x-api-key'] = settings.auth.apiToken;
      }

      // Handle errors
      var interceptor = ['$rootScope', '$q', function ($rootScope, $q) {
        function success(response) {
          return response;
        }
        function error(response) {
          //var status = response.status;
          response.data = (response.data.err) ? response.data.err : response.data;
          if (response.status == 0) response.data = 'Server currently unreachable';
          if (response.status == 500) response.data += '(see Chrome console for more details).';
          $rootScope.flash.errors.push(response.status + ': ' + response.data);
          console.log(arguments);
          return $q.reject(response);
        }
        return function (promise) {
          return promise.then(success, error);
        }
      }];
      $httpProvider.responseInterceptors.push(interceptor);
  }])