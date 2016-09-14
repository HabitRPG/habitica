"use strict";

habitrpg.controller("HallHeroesCtrl", ['$scope', '$rootScope', 'User', 'Notification', 'ApiUrl', 'Hall',
  function($scope, $rootScope, User, Notification, ApiUrl, Hall) {
    $scope.hero = undefined;
    $scope.currentHeroIndex = undefined;
    $scope.heroes = [];

    Hall.getHeroes()
      .then(function (response) {
        $scope.heroes = response.data.data;
      });

    $scope.loadHero = function(uuid, heroIndex) {
      $scope.currentHeroIndex = heroIndex;
      Hall.getHero(uuid)
        .then(function (response) {
          $scope.hero = response.data.data;
        });
    }

    $scope.saveHero = function(hero) {
      $scope.hero.contributor.admin = ($scope.hero.contributor.level > 7) ? true : false;
      Hall.updateHero($scope.hero)
        .then(function (response) {
          Notification.text("User updated");
          $scope.hero = undefined;
          $scope._heroID = undefined;
          $scope.heroes[$scope.currentHeroIndex] = response.data.data;
          $scope.currentHeroIndex = undefined;
        });
    }

    $scope.populateContributorInput = function(id, index) {
      $scope._heroID = id;
      window.scrollTo(0, 200);
      $scope.loadHero(id, index);
    };
  }]);

habitrpg.controller("HallPatronsCtrl", ['$scope', '$rootScope', 'User', 'Notification', 'ApiUrl', 'Hall',
  function($scope, $rootScope, User, Notification, ApiUrl, Hall) {
    var page = 0;
    $scope.patrons = [];

    $scope.loadMore = function() {
      Hall.getPatrons(page++)
        .then(function (response) {
          $scope.patrons = $scope.patrons.concat(response.data.data);
        });
    }
    $scope.loadMore();

  }]);
