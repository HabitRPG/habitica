"use strict";

habitrpg.controller("HallHeroesCtrl", ['$scope', '$rootScope', 'User', 'Notification', 'ApiUrl', 'Hall', 'Content',
  function($scope, $rootScope, User, Notification, ApiUrl, Hall, Content) {
    $scope.hero = undefined;
    $scope.currentHeroIndex = undefined;
    $scope.heroes = [];
    $scope.allItemPaths = getAllItemPaths();

    Hall.getHeroes()
      .then(function (response) {
        $scope.heroes = response.data.data;
      });

    function _getFormattedItemReference (pathPrefix, keys, values) {
      var finishedString = '\n'.concat('path: ', pathPrefix, ', ', 'value: {', values, '}\n');

      _.each(keys, function (key) {
        finishedString = finishedString.concat('\t', pathPrefix, '.', key, '\n');
      });
      return finishedString;
    }

    function getAllItemPaths () {
      var quests = _getFormattedItemReference('items.quests', _.keys(Content.quests), 'Numeric Quantity');
      var mounts = _getFormattedItemReference('items.mounts', _.keys(Content.mountInfo), 'Boolean');
      var food = _getFormattedItemReference('items.food', _.keys(Content.food), 'Numeric Quantity');
      var eggs = _getFormattedItemReference('items.eggs', _.keys(Content.eggs), 'Numeric Quantity');
      var hatchingPotions = _getFormattedItemReference('items.hatchingPotions', _.keys(Content.hatchingPotions), 'Numeric Quantity');
      var pets = _getFormattedItemReference('items.pets', _.keys(Content.petInfo), '-1: Owns Mount, 0: Not Owned, 1-49: Progress to mount');
      var special = _getFormattedItemReference('items.special', _.keys(Content.special), 'Numeric Quantity');
      var gear = _getFormattedItemReference('items.gear.owned', _.keys(Content.gear.flat), 'Boolean');

      var equippedGear = '\nEquipped Gear:\n\titems.gear.{equipped/costume}.{head/headAccessory/eyewear/armor/body/back/shield/weapon}.{gearKey}\n';
      var equippedPet = '\nEquipped Pet:\n\titems.currentPet.{petKey}\n';
      var equippedMount = '\nEquipped Mount:\n\titems.currentMount.{mountKey}\n';

      var data = quests.concat(mounts, food, eggs, hatchingPotions, pets, special, gear, equippedGear, equippedPet, equippedMount);

      return data;
    }

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
