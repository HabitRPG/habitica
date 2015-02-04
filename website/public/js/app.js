"use strict";

window.habitrpg = angular.module('habitrpg',
    ['ui.bootstrap', 'ui.keypress', 'ui.router', 'chieffancypants.loadingBar', 'At', 'infinite-scroll', 'ui.select2', 'angular.filter', 'ngResource', 'ngSanitize'])

  // @see https://github.com/angular-ui/ui-router/issues/110 and https://github.com/HabitRPG/habitrpg/issues/1705
  // temporary hack until they have a better solution

  .constant("API_URL", "")
  .constant("STORAGE_USER_ID", 'habitrpg-user')
  .constant("STORAGE_SETTINGS_ID", 'habit-mobile-settings')
  .constant("MOBILE_APP", false)
  //.constant("STORAGE_GROUPS_ID", "") // if we decide to take groups offline

  .config(['$stateProvider', '$urlRouterProvider', '$httpProvider', 'STORAGE_SETTINGS_ID',
    function($stateProvider, $urlRouterProvider, $httpProvider, STORAGE_SETTINGS_ID) {

      $urlRouterProvider
        // Setup default selected tabs
        .when('/options', '/options/profile/avatar')
        .when('/options/profile', '/options/profile/avatar')
        .when('/options/groups', '/options/groups/tavern')
        .when('/options/groups/guilds', '/options/groups/guilds/public')
        .when('/options/groups/hall', '/options/groups/hall/heroes')
        .when('/options/inventory', '/options/inventory/drops')
        .when('/options/settings', '/options/settings/settings')

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
        .state('options.profile.backgrounds', {
          url: '/backgrounds',
          templateUrl: "partials/options.profile.backgrounds.html"
        })
        .state('options.profile.stats', {
          url: "/stats",
          templateUrl: "partials/options.profile.stats.html"
        })
        .state('options.profile.profile', {
          url: "/profile",
          templateUrl: "partials/options.profile.profile.html"
        })

        // Options > Groups
        .state('options.social', {
          url: "/groups",
          templateUrl: "partials/options.social.html"
        })

        .state('options.social.inbox', {
          url: "/inbox",
          templateUrl: "partials/options.social.inbox.html"
        })

        .state('options.social.tavern', {
          url: "/tavern",
          templateUrl: "partials/options.social.tavern.html",
          controller: 'TavernCtrl'
        })

        .state('options.social.party', {
          url: '/party',
          templateUrl: "partials/options.social.party.html",
          controller: 'PartyCtrl'
        })

        .state('options.social.hall', {
          url: '/hall',
          templateUrl: "partials/options.social.hall.html"
        })
        .state('options.social.hall.heroes', {
          url: '/heroes',
          templateUrl: "partials/options.social.hall.heroes.html",
          controller: 'HallHeroesCtrl'
        })
        .state('options.social.hall.patrons', {
          url: '/patrons',
          templateUrl: "partials/options.social.hall.patrons.html",
          controller: 'HallPatronsCtrl'
        })

        .state('options.social.guilds', {
          url: '/guilds',
          templateUrl: "partials/options.social.guilds.html",
          controller: 'GuildsCtrl'
        })
        .state('options.social.guilds.public', {
          url: '/public',
          templateUrl: "partials/options.social.guilds.public.html"
        })
        .state('options.social.guilds.create', {
          url: '/create',
          templateUrl: "partials/options.social.guilds.create.html"
        })
        .state('options.social.guilds.detail', {
          url: '/:gid',
          templateUrl: 'partials/options.social.guilds.detail.html',
          controller: ['$scope', 'Groups', '$stateParams',
          function($scope, Groups, $stateParams){
            Groups.Group.get({gid:$stateParams.gid}, function(group){
              $scope.group = group;
              Groups.seenMessage(group._id);
            });
          }]
        })

        // Options > Social > Challenges
        .state('options.social.challenges', {
          url: "/challenges",
          controller: 'ChallengesCtrl',
          templateUrl: "partials/options.social.challenges.html"
        })
        .state('options.social.challenges.detail', {
          url: '/:cid',
          templateUrl: 'partials/options.social.challenges.detail.html',
          controller: ['$scope', 'Challenges', '$stateParams',
            function($scope, Challenges, $stateParams){
              $scope.obj = $scope.challenge = Challenges.Challenge.get({cid:$stateParams.cid}, function(){
                $scope.challenge._locked = true;
              });
            }]
        })
        .state('options.social.challenges.detail.member', {
          url: '/:uid',
          templateUrl: 'partials/options.social.challenges.detail.member.html',
          controller: ['$scope', 'Challenges', '$stateParams',
            function($scope, Challenges, $stateParams){
              $scope.obj = Challenges.Challenge.getMember({cid:$stateParams.cid, uid:$stateParams.uid}, function(){
                $scope.obj._locked = true;
              });
            }]
        })

        // Options > Inventory
        .state('options.inventory', {
          url: '/inventory',
          templateUrl: "partials/options.inventory.html",
          controller: 'InventoryCtrl'
        })
        .state('options.inventory.drops', {
          url: '/drops',
          templateUrl: "partials/options.inventory.drops.html"
        })
        .state('options.inventory.pets', {
          url: '/pets',
          templateUrl: "partials/options.inventory.pets.html"
        })
        .state('options.inventory.mounts', {
          url: '/mounts',
          templateUrl: "partials/options.inventory.mounts.html"
        })
        .state('options.inventory.equipment', {
          url: '/equipment',
          templateUrl: "partials/options.inventory.equipment.html"
        })
        .state('options.inventory.timetravelers', {
          url: '/timetravelers',
          templateUrl: "partials/options.inventory.timetravelers.html"
        })
        .state('options.inventory.seasonalshop', {
          url: '/seasonalshop',
          templateUrl: "partials/options.inventory.seasonalshop.html"
        })

        // Options > Settings
        .state('options.settings', {
          url: "/settings",
          controller: 'SettingsCtrl',
          templateUrl: "partials/options.settings.html"
        })
        .state('options.settings.settings', {
          url: "/settings",
          templateUrl: "partials/options.settings.settings.html"
        })
        .state('options.settings.api', {
          url: "/api",
          templateUrl: "partials/options.settings.api.html"
        })
        .state('options.settings.export', {
          url: "/export",
          templateUrl: "partials/options.settings.export.html"
        })
        .state('options.settings.coupon', {
          url: "/coupon",
          templateUrl: "partials/options.settings.coupon.html"
        })
        .state('options.settings.subscription', {
          url: "/subscription",
          templateUrl: "partials/options.settings.subscription.html"
        })
        .state('options.settings.notifications', {
          url: "/notifications",
          templateUrl: "partials/options.settings.notifications.html"
        })

      var settings = JSON.parse(localStorage.getItem(STORAGE_SETTINGS_ID));
      if (settings && settings.auth) {
        $httpProvider.defaults.headers.common['Content-Type'] = 'application/json;charset=utf-8';
        $httpProvider.defaults.headers.common['x-api-user'] = settings.auth.apiId;
        $httpProvider.defaults.headers.common['x-api-key'] = settings.auth.apiToken;
      }
  }])
