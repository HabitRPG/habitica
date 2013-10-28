"use strict";

window.habitrpg = angular.module('habitrpg',
    ['ngRoute', 'ngResource', 'ngSanitize', 'userServices', 'groupServices', 'memberServices', 'challengeServices', 'sharedServices', 'authServices', 'notificationServices', 'guideServices', 'ui.bootstrap', 'ui.keypress', 'ui.router'])

  .constant("API_URL", "")
  .constant("STORAGE_USER_ID", 'habitrpg-user')
  .constant("STORAGE_SETTINGS_ID", 'habit-mobile-settings')
  //.constant("STORAGE_GROUPS_ID", "") // if we decide to take groups offline

  .config(['$stateProvider', '$urlRouterProvider', '$httpProvider', 'STORAGE_SETTINGS_ID',
    function($stateProvider, $urlRouterProvider, $httpProvider, STORAGE_SETTINGS_ID) {

      $urlRouterProvider
        // Setup default selected tabs
        .when('/options', '/options/profile/avatar')
        .when('/options/profile', '/options/profile/avatar')
        .when('/options/groups', '/options/groups/tavern')
        .when('/options/inventory', '/options/inventory/inventory')

        // redirect states that don't match
        .otherwise("/tasks");

      $stateProvider

        // Tasks
        .state('tasks', {
          url: "/tasks",
          templateUrl: "partials/main.html"
        })

        // Options
        .state('options', {
          url: "/options",
          templateUrl: "partials/options.html",
          controller: function(){}
        })

        // Options > Profile
        .state('options.profile', {
          url: "/profile",
          templateUrl: "partials/options.profile.html",
          controller: 'UserCtrl'
        })
        .state('options.profile.avatar', {
          url: "/avatar",
          templateUrl: "partials/options.profile.avatar.html"
        })
        .state('options.profile.stats', {
          url: "/stats",
          templateUrl: "partials/options.profile.stats.html"
        })
        .state('options.profile.profile', {
          url: "/stats",
          templateUrl: "partials/options.profile.profile.html"
        })

        // Options > Groups
        .state('options.groups', {
          url: "/groups",
          templateUrl: "partials/options.groups.html"
        })
        .state('options.groups.tavern', {
          url: "/tavern",
          templateUrl: "partials/options.groups.tavern.html",
          controller: 'TavernCtrl'
          // TODO this doesn't work, seems ngResource doesn't get the .then() function
//          resolve: {
//            group: ['Groups', function(Groups){
//              //return Groups.fetchTavern();
//            }]
//          }
        })
        .state('options.groups.party', {
          url: '/party',
          templateUrl: "partials/options.groups.party.html",
          controller: 'PartyCtrl'
        })
        .state('options.groups.guilds', {
          url: '/party',
          templateUrl: "partials/options.groups.guilds.html",
          controller: 'GuildsCtrl'
        })

        // Options > Inventory
        .state('options.inventory', {
          url: '/inventory',
          templateUrl: "partials/options.inventory.html"
        })
        .state('options.inventory.inventory', {
          url: '/inventory',
          templateUrl: "partials/options.inventory.inventory.html"
        })
        .state('options.inventory.stable', {
          url: '/stable',
          templateUrl: "partials/options.inventory.stable.html"
        })

        // Options > Challenges
        .state('options.challenges', {
          url: "/challenges",
          controller: 'ChallengesCtrl',
          templateUrl: "partials/options.challenges.html",
          resolve: {
            groups: ['$http', 'API_URL', function($http, API_URL){
              // TODO come up with more unified ngResource-style approach
              return $http.get(API_URL + '/api/v1/groups?minimal=true');
            }],
            challenges: ['Challenges', function(Challenges){
              return Challenges.Challenge.query();
            }]
          }
        })

        // Options > Settings
        .state('options.settings', {
          url: "/settings",
          controller: 'SettingsCtrl',
          templateUrl: "partials/options.settings.html"
        })

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