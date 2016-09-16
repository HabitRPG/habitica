habitrpg.controller("InventoryCtrl",
  ['$rootScope', '$scope', 'Shared', '$window', 'User', 'Content', 'Analytics', 'Quests', 'Stats', 'Social', 'Achievement',
  function($rootScope, $scope, Shared, $window, User, Content, Analytics, Quests, Stats, Social, Achievement) {

    var user = User.user;

    // convenience vars since these are accessed frequently

    $scope.selectedEgg = null; // {index: 1, name: "Tiger", value: 5}
    $scope.selectedPotion = null; // {index: 5, name: "Red", value: 3}

    _updateDropAnimalCount(user.items);

    // Social sharing buttons
    $scope.loadWidgets = Social.loadWidgets;

    // Functions from Quests service
    $scope.lockQuest = Quests.lockQuest;

    $scope.buyQuest = function(questScroll) {
      Quests.buyQuest(questScroll)
        .then(function(quest) {
          $rootScope.selectedQuest = quest;
          $rootScope.openModal('buyQuest', {controller:'InventoryCtrl'});
        });
    };

    $scope.questPopover = Quests.questPopover;

    $scope.showQuest = function(questScroll) {
      Quests.showQuest(questScroll)
        .then(function(quest) {
          $rootScope.selectedQuest = quest;
          $rootScope.openModal('showQuest', {controller:'InventoryCtrl'});
        });
    };

    $scope.questInit = function() {
      var key = $rootScope.selectedQuest.key;

      Quests.initQuest(key).then(function() {
        $rootScope.selectedQuest = undefined;
        $scope.$close();
      });
    };

    // count egg, food, hatchingPotion stack totals
    var countStacks = function(items) { return _.reduce(items,function(m,v){return m+v;},0);}

    $scope.$watch('user.items.eggs', function(eggs){ $scope.eggCount = countStacks(eggs); }, true);
    $scope.$watch('user.items.hatchingPotions', function(pots){ $scope.potCount = countStacks(pots); }, true);
    $scope.$watch('user.items.food', function(food){ $scope.foodCount = countStacks(food); }, true);
    $scope.$watch('user.items.quests', function(quest){ $scope.questCount = countStacks(quest); }, true);

    $scope.$watch('user.items.gear', function(gear){
      $scope.gearByClass = {};
      $scope.gearByType = {};
      _.each(gear.owned, function(v,key){
        if (v === false) {
          return;
        }

        var item = Content.gear.flat[key];

        var bonusMultiplier = 1;
        if (_isClassItem(item)) {
          bonusMultiplier = 1.5;
        }

        item._effectiveStr = item.str * bonusMultiplier;
        item._effectiveCon = item.con * bonusMultiplier;
        item._effectivePer = item.per * bonusMultiplier;
        item._effectiveInt = item.int * bonusMultiplier;

        if (!$scope.gearByClass[item.klass]) {
          $scope.gearByClass[item.klass] = [];
        }
        $scope.gearByClass[item.klass].push(item);

        if (!$scope.gearByType[item.type]) {
          $scope.gearByType[item.type] = [];
        }

        $scope.gearByType[item.type].push(item);
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
        User.sell({params:{type:type, key: $scope[selected].key}});
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

      var userHasPet = user.items.pets[egg.key + '-' + potion.key] > 0;
      var isPremiumPet = Content.hatchingPotions[potion.key].premium && !Content.dropEggs[egg.key];

      User.hatch({params:{egg:egg.key, hatchingPotion:potion.key}});

      if (!user.preferences.suppressModals.hatchPet && !userHasPet && !isPremiumPet) {
        $scope.hatchedPet = {
          egg: eggName,
          potion: potName,
          potionKey:potion.key,
          eggKey: egg.key,
          pet: 'Pet-' + egg.key + '-' + potion.key
        };

        $rootScope.openModal('hatchPet', {
          scope: $scope,
          size: 'sm'
        });
      }

      $scope.selectedEgg = null;
      $scope.selectedPotion = null;

      _updateDropAnimalCount(user.items);

      // Checks if beastmaster has been reached for the first time
      if(!user.achievements.beastMaster
          && $scope.petCount >= 90) {
        User.user.achievements.beastMaster = true;
        Achievement.displayAchievement('beastMaster');
      }

      // Checks if Triad Bingo has been reached for the first time
      if(!user.achievements.triadBingo
          && $scope.mountCount >= 90
          && Shared.count.dropPetsCurrentlyOwned(User.user.items.pets) >= 90) {
        User.user.achievements.triadBingo = true;
        Achievement.displayAchievement('triadBingo');
      }
    }

    $scope.choosePet = function(egg, potion){
      var pet = Content.petInfo[egg + '-' + potion];
      var petDisplayName = pet.text();

      // Feeding Pet
      if ($scope.selectedFood) {
        var food = $scope.selectedFood;
        var startingMounts = $rootScope.countExists(user.items.mounts);
        if (food.key === 'Saddle') {
          if (!$window.confirm(window.env.t('useSaddle', {pet: petDisplayName}))) return;
        } else if (!$window.confirm(window.env.t('feedPet', {name: petDisplayName, article: food.article, text: food.text()}))) {
          return;
        }
        User.feed({params:{pet: pet.key, food: food.key}});
        $scope.selectedFood = null;

        _updateDropAnimalCount(user.items);
        if ($rootScope.countExists(user.items.mounts) > startingMounts && !user.preferences.suppressModals.raisePet) {
          $scope.raisedPet = {
            displayName: petDisplayName,
            spriteName: pet.key,
            egg: egg,
            potion: potion
          }
          $rootScope.openModal('raisePet', {
            scope: $scope,
            size:'sm'
          });
        }

        // Checks if mountmaster has been reached for the first time
        if(!user.achievements.mountMaster
            && $scope.mountCount >= 90) {
          User.user.achievements.mountMaster = true;
          Achievement.displayAchievement('mountMaster');
        }

      // Selecting Pet
      } else {
        User.equip({params:{type: 'pet', key: pet.key}});
      }
    }

    $scope.chooseMount = function(egg, potion) {
      User.equip({params:{type: 'mount', key: egg + '-' + potion}});
    }

    $scope.getSeasonalShopArray = function(set){
      var flatGearArray = _.toArray(Content.gear.flat);

      var filteredArray = _.where(flatGearArray, {index: set});

      return filteredArray;
    };

    $scope.getSeasonalShopQuests = function(set){
      var questArray = _.toArray(Content.quests);

      var filteredArray = _.filter(questArray, function(q){
        return q.key === ('egg');
      });

      return filteredArray;
    };

    $scope.dequip = function(itemSet){
      switch (itemSet) {
        case "battleGear":
          for (item in user.items.gear.equipped){
            var itemKey = user.items.gear.equipped[item];
            if (user.items.gear.owned[itemKey]) {
              User.equip({params: {type: 'equipped', key: itemKey}});
            }
          }
          break;

        case "costume":
          for (item in user.items.gear.costume){
            var itemKey = user.items.gear.costume[item];
            if (user.items.gear.owned[itemKey]) {
              User.equip({params: {type:"costume", key: itemKey}});
            }
          }
          break;

        case "petMountBackground":
          var pet = user.items.currentPet;
          if (pet) {
            User.equip({params:{type: 'pet', key: pet}});
          }

          var mount = user.items.currentMount;
          if (mount) {
            User.equip({params:{type: 'mount', key: mount}});
          }

          var background = user.preferences.background;
          if (background) {
            User.unlock({query:{path:"background."+background}});
          }

          break;
      }
    };

    var listenForEscape = function (event) {
      if (event.keyCode === 27) {
        $scope.deselectItem();
      }
    }

    document.addEventListener('keydown', listenForEscape);

    $rootScope.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams, options){
      if (toState.name.indexOf('options.inventory') < 0) {
        document.removeEventListener('keydown', listenForEscape);
      }
    });

    $scope.deselectItem = function() {
      $scope.selectedFood = null;
      $scope.selectedPotion = null;
      $scope.selectedEgg = null;
    };

    $scope.openCardsModal = function(type, numberOfVariations) {
      var cardsModalScope = $rootScope.$new();
      cardsModalScope.cardType = type;
      cardsModalScope.cardMessage = _generateCard(type, numberOfVariations);

      $rootScope.openModal('cards', {
        scope: cardsModalScope
      });
    };

    $scope.classBonusNotes = function (item) {
      if (_isClassItem(item)) {
        return window.env.t('classBonus');
      }
    };

    $scope.hasAllTimeTravelerItems = function() {
      return ($scope.hasAllTimeTravelerItemsOfType('mystery') &&
        $scope.hasAllTimeTravelerItemsOfType('pets') &&
        $scope.hasAllTimeTravelerItemsOfType('mounts'));
    };

    $scope.hasAllTimeTravelerItemsOfType = function(type) {
      if (type === 'mystery') {
        var itemsLeftInTimeTravelerStore = Content.timeTravelerStore(user.items.gear.owned);
        var keys = Object.keys(itemsLeftInTimeTravelerStore);

        return keys.length === 0;
      }

      if (type === 'pets' || type === 'mounts') {
        for (var key in Content.timeTravelStable[type]) {
          if (!user.items[type][key]) return false;
        }
        return true;
      }
      else return Console.log('Time Traveler item type must be in ["pets","mounts","mystery"]');
    };

    $scope.clickTimeTravelItem = function(type,key) {
      if (user.purchased.plan.consecutive.trinkets < 1) return User.hourglassPurchase({params:{type:type,key:key}});
      if (!window.confirm(window.env.t('hourglassBuyItemConfirm'))) return;
      User.hourglassPurchase({params:{type:type,key:key}});
    };

    $scope.marketShopCategories = Shared.shops.getMarketCategories(user);
    $scope.questShopCategories = Shared.shops.getQuestShopCategories(user);
    $scope.timeTravelersCategories = Shared.shops.getTimeTravelersCategories(user);
    $scope.seasonalShopCategories = Shared.shops.getSeasonalShopCategories(user);

    $scope.shouldShowPremiumPetRow = function (potion) {
      var premiumPotion = Content.premiumHatchingPotions[potion];

      if (!premiumPotion) {
        return false;
      }
      if (user.items.hatchingPotions[premiumPotion.key] > 0) {
        return true;
      }
      if (premiumPotion.canBuy()) {
        return true;
      }

      return $scope.hasAPetOfPotion(potion);
    };

    $scope.shouldShowPremiumPetSection = function () {
      var potions = Content.premiumHatchingPotions;
      return Object.keys(potions).find(function (potion) {
        return $scope.shouldShowPremiumPetRow(potions[potion].key);
      });
    };

    $scope.shouldShowPremiumMountSection = function () {
      return findPet(function (pet) {
        return pet.type === 'premium';
      });
    };

    $scope.hasAPetOfPotion = function (potion) {
      return findPet(function (pet) {
        return pet.potion === potion;
      });
    };

    function findPet (fn) {
      var pets = Object.keys(user.items.pets);
      return pets.find(function (petKey) {
        var pet = Content.petInfo[petKey];
        return fn(pet);
      });
    }

    function _updateDropAnimalCount(items) {
      $scope.petCount = Shared.count.beastMasterProgress(items.pets);
      $scope.mountCount = Shared.count.mountMasterProgress(items.mounts);
      $scope.beastMasterProgress = Stats.beastMasterProgress(items.pets);
      $scope.mountMasterProgress = Stats.mountMasterProgress(items.mounts);
    }

    function _generateCard(kind, numberOfVariations) {
      var random = Math.random() * numberOfVariations;
      var selection = Math.floor(random);
      return env.t(kind + selection);
    }

    function _isClassItem(item) {
      var userClass = user.stats.class;

      return item.klass === userClass || item.specialClass === userClass;
    }
  }
]);
