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
      let finishedString = '\n'.concat('path: ', pathPrefix, ', ', 'value: {', values, '}\n');

      _.each(keys, (key) => {
        finishedString = finishedString.concat('\t', pathPrefix, '.', key, '\n');
      });
      return finishedString;
    }

    function getAllItemPaths () {
      let content = Content;

      let quests = _getFormattedItemReference('items.quests', _.keys(content.quests), 'Numeric Quantity');
      let mounts = _getFormattedItemReference('items.mounts', _.keys(content.mountInfo), 'Boolean');
      let food = _getFormattedItemReference('items.food', _.keys(content.food), 'Numeric Quantity');
      let eggs = _getFormattedItemReference('items.eggs', _.keys(content.eggs), 'Numeric Quantity');
      let hatchingPotions = _getFormattedItemReference('items.hatchingPotions', _.keys(content.hatchingPotions), 'Numeric Quantity');
      let pets = _getFormattedItemReference('items.pets', _.keys(content.petInfo), '-1: Owns Mount, 0: Not Owned, 1-49: Progress to mount');
      let special = _getFormattedItemReference('items.special', _.keys(content.special), 'Numeric Quantity');

      let mystery = _.flatten(_.keys(content.mystery).map((mysterySetKey) => {
        return content.mystery[mysterySetKey];
      })).map((mysteryItem) => {
        return mysteryItem.items.map((item) => {
          return item.key;
        });
      });

      let gear = _getFormattedItemReference('items.gear.owned', _.union(_.keys(content.gear.flat), _.flatten(mystery)), 'Boolean');

      let equippedGear = '\nEquipped Gear:\n\titems.gear.{equipped/costume}.{head/headAccessory/eyewear/armor/body/back/shield/weapon}.{gearKey}\n';
      let equippedPet = '\nEquipped Pet:\n\titems.currentPet.{petKey}\n';
      let equippedMount = '\nEquipped Mount:\n\titems.currentMount.{mountKey}\n';

      let data = quests.concat(mounts, food, eggs, hatchingPotions, pets, special, gear, equippedGear, equippedPet, equippedMount);

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
