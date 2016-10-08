"use strict";

/* Refresh page if idle > 6h */
var REFRESH_FREQUENCY = 21600000;
var refresh;
window.refresher = function() {
  window.location.reload(true);
};

var awaitIdle = function() {
  if(refresh) clearTimeout(refresh);
  refresh = setTimeout(window.refresher, REFRESH_FREQUENCY);
};

awaitIdle();
$(document).on('mousemove keydown mousedown touchstart', awaitIdle);
/* Refresh page if idle > 6h */

window.habitrpg = angular.module('habitrpg',
    ['ui.bootstrap', 'ui.keypress', 'ui.router', 'chieffancypants.loadingBar', 'At', 'infinite-scroll', 'ui.select2', 'angular.filter', 'ngResource', 'ngSanitize'])

  // @see https://github.com/angular-ui/ui-router/issues/110 and https://github.com/HabitRPG/habitrpg/issues/1705
  // temporary hack until they have a better solution

  .constant("API_URL", "")
  .constant("STORAGE_USER_ID", 'habitrpg-user')
  .constant("STORAGE_SETTINGS_ID", 'habit-mobile-settings')
  .constant("MOBILE_APP", false)
  .constant("TAVERN_ID", window.habitrpgShared.TAVERN_ID)
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
        // post cards with promo codes went out with this address
        .when('/options/settings/coupon', '/options/settings/promo')

        // redirect states that don't match
        .otherwise("/tasks");

      $stateProvider

        // Tasks
        .state('tasks', {
          url: "/tasks",
          templateUrl: "partials/main.html",
          title: env.t('titleTasks')
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
          templateUrl: "partials/options.profile.avatar.html",
          title: env.t('titleAvatar')
        })
        .state('options.profile.backgrounds', {
          url: '/backgrounds',
          templateUrl: "partials/options.profile.backgrounds.html",
          title: env.t('titleBackgrounds')
        })
        .state('options.profile.stats', {
          url: "/stats",
          templateUrl: "partials/options.profile.stats.html",
          title: env.t('titleStats')
        })
        .state('options.profile.achievements', {
          url: "/achievements",
          templateUrl: "partials/options.profile.achievements.html",
          title: env.t('titleAchievs')
        })
        .state('options.profile.profile', {
          url: "/profile",
          templateUrl: "partials/options.profile.profile.html",
          title: env.t('titleProfile')
        })

        // Options > Groups
        .state('options.social', {
          url: "/groups",
          templateUrl: "partials/options.social.html"
        })

        .state('options.social.inbox', {
          url: '/inbox',
          templateUrl: 'partials/options.social.inbox.html',
          controller: 'InboxCtrl',
          title: env.t('titleInbox')
        })

        .state('options.social.tavern', {
          url: "/tavern",
          templateUrl: "partials/options.social.tavern.html",
          controller: 'TavernCtrl',
          title: env.t('titleTavern')
        })

        .state('options.social.party', {
          url: '/party',
          templateUrl: "partials/options.social.party.html",
          controller: 'PartyCtrl',
          title: env.t('titleParty')
        })

        .state('options.social.hall', {
          url: '/hall',
          templateUrl: "partials/options.social.hall.html"
        })
        .state('options.social.hall.heroes', {
          url: '/heroes',
          templateUrl: "partials/options.social.hall.heroes.html",
          controller: 'HallHeroesCtrl',
          title: env.t('titleHeroes')
        })
        .state('options.social.hall.patrons', {
          url: '/patrons',
          templateUrl: "partials/options.social.hall.patrons.html",
          controller: 'HallPatronsCtrl',
          title: env.t('titlePatrons')
        })

        .state('options.social.guilds', {
          url: '/guilds',
          templateUrl: "partials/options.social.guilds.html",
          controller: 'GuildsCtrl',
          title: env.t('titleGuilds')
        })
        .state('options.social.guilds.public', {
          url: '/public',
          templateUrl: "partials/options.social.guilds.public.html",
          title: env.t('titleGuilds')
        })
        .state('options.social.guilds.create', {
          url: '/create',
          templateUrl: "partials/options.social.guilds.create.html",
          title: env.t('titleGuilds')
        })
        .state('options.social.guilds.detail', {
          url: '/:gid',
          templateUrl: 'partials/options.social.guilds.detail.html',
          title: env.t('titleGuilds'),
          controller: ['$scope', 'Groups', 'Chat', '$stateParams', 'Members', 'Challenges', 'Tasks',
          function($scope, Groups, Chat, $stateParams, Members, Challenges, Tasks) {
            Groups.Group.get($stateParams.gid)
              .then(function (response) {
                $scope.obj = $scope.group = response.data.data;
                Chat.markChatSeen($scope.group._id);
                Members.getGroupMembers($scope.group._id)
                  .then(function (response) {
                    $scope.group.members = response.data.data;
                  });
                Members.getGroupInvites($scope.group._id)
                  .then(function (response) {
                    $scope.group.invites = response.data.data;
                  });
                Challenges.getGroupChallenges($scope.group._id)
                  .then(function (response) {
                    $scope.group.challenges = response.data.data;
                  });
                //@TODO: Add this back when group tasks go live
                // return Tasks.getGroupTasks($scope.group._id);
              })
              // .then(function (response) {
              //   var tasks = response.data.data;
              //   tasks.forEach(function (element, index, array) {
              //     if (!$scope.group[element.type + 's']) $scope.group[element.type + 's'] = [];
              //     $scope.group[element.type + 's'].push(element);
              //   })
              // });
          }]
        })

        // Options > Social > Challenges
        .state('options.social.challenges', {
          url: "/challenges",
          params: { groupIdFilter: null },
          controller: 'ChallengesCtrl',
          templateUrl: "partials/options.social.challenges.html",
          title: env.t('titleChallenges')
        })
        .state('options.social.challenges.detail', {
          url: '/:cid',
          templateUrl: 'partials/options.social.challenges.detail.html',
          title: env.t('titleChallenges'),
          controller: ['$scope', 'Challenges', '$stateParams', 'Tasks', 'Members',
            function ($scope, Challenges, $stateParams, Tasks, Members) {
              Challenges.getChallenge($stateParams.cid)
                .then(function (response) {
                  $scope.obj = $scope.challenge = response.data.data;
                  $scope.challenge._locked = true;
                  return Tasks.getChallengeTasks($scope.challenge._id);
                })
                .then(function (response) {
                  var tasks = response.data.data;
                  tasks.forEach(function (element, index, array) {
                    if (!$scope.challenge[element.type + 's']) $scope.challenge[element.type + 's'] = [];
                    $scope.challenge[element.type + 's'].push(element);
                  })

                  return Members.getChallengeMembers($scope.challenge._id);
                })
                .then(function (response) {
                  $scope.challenge.members = response.data.data;
                });
            }]
        })
        .state('options.social.challenges.edit', {
          url: '/:cid/edit',
          templateUrl: 'partials/options.social.challenges.detail.html',
          title: env.t('titleChallenges'),
          controller: ['$scope', 'Challenges', '$stateParams', 'Tasks',
            function ($scope, Challenges, $stateParams, Tasks) {
              Challenges.getChallenge($stateParams.cid)
                .then(function (response) {
                  $scope.obj = $scope.challenge = response.data.data;
                  $scope.challenge._locked = false;
                  return Tasks.getChallengeTasks($scope.challenge._id);
                })
                .then(function (response) {
                  var tasks = response.data.data;
                  tasks.forEach(function (element, index, array) {
                    if (!$scope.challenge[element.type + 's']) $scope.challenge[element.type + 's'] = [];
                    $scope.challenge[element.type + 's'].push(element);
                  })
                });
            }]
        })
        .state('options.social.challenges.detail.member', {
          url: '/:uid',
          templateUrl: 'partials/options.social.challenges.detail.member.html',
          title: env.t('titleChallenges'),
          controller: ['$scope', 'Members', '$stateParams',
            function($scope, Members, $stateParams){
              Members.getChallengeMemberProgress($stateParams.cid, $stateParams.uid)
                .then(function(response) {
                  $scope.obj = response.data.data;

                  $scope.obj.habits = [];
                  $scope.obj.todos = [];
                  $scope.obj.dailys = [];
                  $scope.obj.rewards = [];
                  $scope.obj.tasks.forEach(function (element, index, array) {
                    $scope.obj[element.type + 's'].push(element)
                  });

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
          templateUrl: "partials/options.inventory.drops.html",
          title: env.t('titleDrops')
        })
        .state('options.inventory.quests', {
          url: '/quests',
          templateUrl: "partials/options.inventory.quests.html",
          title: env.t('titleQuests')
        })
        .state('options.inventory.pets', {
          url: '/pets',
          templateUrl: "partials/options.inventory.pets.html",
          title: env.t('titlePets')
        })
        .state('options.inventory.mounts', {
          url: '/mounts',
          templateUrl: "partials/options.inventory.mounts.html",
          title: env.t('titleMounts')
        })
        .state('options.inventory.equipment', {
          url: '/equipment',
          templateUrl: "partials/options.inventory.equipment.html",
          title: env.t('titleEquipment')
        })
        .state('options.inventory.timetravelers', {
          url: '/timetravelers',
          templateUrl: "partials/options.inventory.timetravelers.html",
          title: env.t('titleTimeTravelers')
        })
        .state('options.inventory.seasonalshop', {
          url: '/seasonalshop',
          templateUrl: "partials/options.inventory.seasonalshop.html",
          title: env.t('titleSeasonalShop')
        })

        // Options > Settings
        .state('options.settings', {
          url: "/settings",
          controller: 'SettingsCtrl',
          templateUrl: "partials/options.settings.html",
        })
        .state('options.settings.settings', {
          url: "/settings",
          templateUrl: "partials/options.settings.settings.html",
          title: env.t('titleSettings')
        })
        .state('options.settings.api', {
          url: "/api",
          templateUrl: "partials/options.settings.api.html",
          title: env.t('titleSettings')
        })
        .state('options.settings.export', {
          url: "/export",
          templateUrl: "partials/options.settings.export.html",
          title: env.t('titleSettings')
        })
        .state('options.settings.promo', {
          url: "/promo",
          templateUrl: "partials/options.settings.promo.html",
          title: env.t('titleSettings')
        })
        .state('options.settings.subscription', {
          url: "/subscription",
          templateUrl: "partials/options.settings.subscription.html",
          title: env.t('titleSettings')
        })
        .state('options.settings.notifications', {
          url: "/notifications",
          templateUrl: "partials/options.settings.notifications.html",
          title: env.t('titleSettings')
        });

      var settings;

      try {
        settings = JSON.parse(localStorage.getItem(STORAGE_SETTINGS_ID));
      } catch (e) {
        settings = {};
      }

      if (settings && settings.auth && settings.auth.apiId && settings.auth.apiToken) {
        $httpProvider.defaults.headers.common['x-api-user'] = settings.auth.apiId;
        $httpProvider.defaults.headers.common['x-api-key'] = settings.auth.apiToken;
      }

      $httpProvider.defaults.headers.common['Content-Type'] = 'application/json;charset=utf-8';
      $httpProvider.defaults.headers.common['x-client'] = 'habitica-web';
  }]);
