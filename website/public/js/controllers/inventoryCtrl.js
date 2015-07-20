habitrpg.controller("InventoryCtrl",
  ['$rootScope', '$scope', 'Shared', '$window', 'User', 'Content', 'Analytics', 'Quests',
  function($rootScope, $scope, Shared, $window, User, Content, Analytics, Quests) {

    var user = User.user;

    // convenience vars since these are accessed frequently

    $scope.selectedEgg = null; // {index: 1, name: "Tiger", value: 5}
    $scope.selectedPotion = null; // {index: 5, name: "Red", value: 3}
    $scope.totalPets = _.size(Content.dropEggs) * _.size(Content.hatchingPotions);
    $scope.totalMounts = _.size(Content.dropEggs) * _.size(Content.hatchingPotions);

    // Functions from Quests service
    $scope.lockQuest = Quests.lockQuest;
    $scope.buyQuest = Quests.buyQuest;
    $scope.questPopover = Quests.questPopover;
    $scope.showQuest = Quests.showQuest;
    $scope.closeQuest = Quests.closeQuest;

    // count egg, food, hatchingPotion stack totals
    var countStacks = function(items) { return _.reduce(items,function(m,v){return m+v;},0);}

    $scope.$watch('user.items.eggs', function(eggs){ $scope.eggCount = countStacks(eggs); }, true);
    $scope.$watch('user.items.hatchingPotions', function(pots){ $scope.potCount = countStacks(pots); }, true);
    $scope.$watch('user.items.food', function(food){ $scope.foodCount = countStacks(food); }, true);
    $scope.$watch('user.items.quests', function(quest){ $scope.questCount = countStacks(quest); }, true);

    $scope.$watch('user.items.gear', function(gear){
      $scope.gear = {};
      _.each(gear.owned, function(v,key){
        if (v === false) return;
        var item = Content.gear.flat[key];
        if (!$scope.gear[item.klass]) $scope.gear[item.klass] = [];
        $scope.gear[item.klass].push(item);
      })
    }, true);

    $scope.chooseEgg = function(egg){
      if ($scope.selectedEgg && $scope.selectedEgg.key == egg) {
        return $scope.selectedEgg = null; // clicked same egg, unselect
      }
      var eggData = _.findWhere(Content.eggs, {key:egg});
      if (!$scope.selectedPotion) {
        $scope.selectedEgg = eggData;
      } else {
        $scope.hatch(eggData, $scope.selectedPotion);
      }
      $scope.selectedFood = null;
    }

    $scope.choosePotion = function(potion){
      if ($scope.selectedPotion && $scope.selectedPotion.key == potion) {
        return $scope.selectedPotion = null; // clicked same egg, unselect
      }
      // we really didn't think through the way these things are stored and getting passed around...
      var potionData = _.findWhere(Content.hatchingPotions, {key:potion});
      if (!$scope.selectedEgg) {
        $scope.selectedPotion = potionData;
      } else {
        $scope.hatch($scope.selectedEgg, potionData);
      }
      $scope.selectedFood = null;
    }

    $scope.chooseFood = function(food){
      if ($scope.selectedFood && $scope.selectedFood.key == food) return $scope.selectedFood = null;
      $scope.selectedFood = Content.food[food];
      $scope.selectedEgg = $scope.selectedPotion = null;
    }

    $scope.sellInventory = function() {
      var selected = $scope.selectedEgg ? 'selectedEgg' : $scope.selectedPotion ? 'selectedPotion' : $scope.selectedFood ? 'selectedFood' : undefined;
      if (selected) {
        var type = $scope.selectedEgg ? 'eggs' : $scope.selectedPotion ? 'hatchingPotions' : $scope.selectedFood ? 'food' : undefined;
        user.ops.sell({params:{type:type, key: $scope[selected].key}});
        if (user.items[type][$scope[selected].key] < 1) {
          $scope[selected] = null;
        }
      }
    }

    $scope.ownedItems = function(inventory){
      return _.pick(inventory, function(v,k){return v>0;});
    }

    $scope.hatch = function(egg, potion){
      var eggName = Content.eggs[egg.key].text();
      var potName = Content.hatchingPotions[potion.key].text();
      if (!$window.confirm(window.env.t('hatchAPot', {potion: potName, egg: eggName}))) return;
      user.ops.hatch({params:{egg:egg.key, hatchingPotion:potion.key}});
      $scope.selectedEgg = null;
      $scope.selectedPotion = null;

      // Checks if beastmaster has been reached for the first time
      if(!User.user.achievements.beastMaster
          && $rootScope.petCount >= 90) {
        User.user.achievements.beastMaster = true;
        $rootScope.openModal('achievements/beastMaster');
      }

      // Checks if Triad Bingo has been reached for the first time
      if(!User.user.achievements.triadBingo
          && $rootScope.mountCount >= 90
          && Shared.countTriad(User.user.items.pets) >= 90) {
        User.user.achievements.triadBingo = true;
        $rootScope.openModal('achievements/triadBingo');
      }
    }

    $scope.choosePet = function(egg, potion){
      var petDisplayName = env.t('petName', {
          potion: Content.hatchingPotions[potion] ? Content.hatchingPotions[potion].text() : potion,
          egg: Content.eggs[egg] ? Content.eggs[egg].text() : egg
        }),
        pet = egg + '-' + potion;

      // Feeding Pet
      if ($scope.selectedFood) {
        var food = $scope.selectedFood
        if (food.key == 'Saddle') {
          if (!$window.confirm(window.env.t('useSaddle', {pet: petDisplayName}))) return;
        } else if (!$window.confirm(window.env.t('feedPet', {name: petDisplayName, article: food.article, text: food.text()}))) {
          return;
        }
        User.user.ops.feed({params:{pet: pet, food: food.key}});
        $scope.selectedFood = null;
        $rootScope.mountCount = Shared.countMounts($rootScope.countExists(User.user.items.mounts), User.user.items.mounts);

      // Checks if mountmaster has been reached for the first time
      if(!User.user.achievements.mountMaster
          && $rootScope.mountCount >= 90) {
        User.user.achievements.mountMaster = true;
        $rootScope.openModal('achievements/mountMaster');
      }

      // Selecting Pet
      } else {
        User.user.ops.equip({params:{type: 'pet', key: pet}});
      }
    }

    $scope.chooseMount = function(egg, potion) {
      User.user.ops.equip({params:{type: 'mount', key: egg + '-' + potion}});
    }

    $scope.questInit = function(){
      Analytics.track({'hitType':'event','eventCategory':'behavior','eventAction':'quest','owner':true,'response':'accept','questName':$scope.selectedQuest.key});
      $rootScope.party.$questAccept({key:$scope.selectedQuest.key}, function(){
        $rootScope.party.$get();
      });
      $scope.closeQuest();
    }

    $scope.getSeasonalShopArray = function(set){
      var flatGearArray = _.toArray(Content.gear.flat);

      var filteredArray = _.where(flatGearArray, {index: set});

      return filteredArray;
    };

    $scope.getSeasonalShopQuests = function(set){
      var questArray = _.toArray(Content.quests);

      var filteredArray = _.filter(questArray, function(q){
        return q.key == "egg";
      });

      return filteredArray;
    };

    $scope.dequip = function(itemSet){
      switch (itemSet) {
        case "battleGear":
          for (item in user.items.gear.equipped){
            var itemKey = user.items.gear.equipped[item];
            if (user.items.gear.owned[itemKey]) {
              user.ops.equip({params: {key: itemKey}});
            }
          }
          break;

        case "costume":
          for (item in user.items.gear.costume){
            var itemKey = user.items.gear.costume[item];
            if (user.items.gear.owned[itemKey]) {
              user.ops.equip({params: {type:"costume", key: itemKey}});
            }
          }
          break;

        case "petMountBackground":
          var pet = user.items.currentPet;
          if (pet) {
            user.ops.equip({params:{type: 'pet', key: pet}});
          }

          var mount = user.items.currentMount;
          if (mount) {
            user.ops.equip({params:{type: 'mount', key: mount}});
          }

          var background = user.preferences.background;
          if (background) {
            User.user.ops.unlock({query:{path:"background."+background}});
          }

          break;
      }
    };
  }
]);
