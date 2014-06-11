habitrpg.controller("InventoryCtrl", ['$rootScope', '$scope', '$window', 'User', 'Content',
  function($rootScope, $scope, $window, User, Content) {

    var user = User.user;

    // convenience vars since these are accessed frequently

    $scope.selectedEgg = null; // {index: 1, name: "Tiger", value: 5}
    $scope.selectedPotion = null; // {index: 5, name: "Red", value: 3}
    $scope.totalPets = _.size(Content.dropEggs) * _.size(Content.hatchingPotions);
    $scope.totalMounts = _.size(Content.eggs) * _.size(Content.hatchingPotions);

    // count egg, food, hatchingPotion stack totals
    var countStacks = function(items) { return _.reduce(items,function(m,v){return m+v;},0);}

    $scope.$watch('user.items.mounts', function(mounts){ $scope.mountCount = $rootScope.countExists(mounts); }, true);
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
    }

    $scope.purchase = function(type, item){
      var gems = User.user.balance * 4;

      if(gems < item.value) return $rootScope.openModal('buyGems');
      var string = (type == 'hatchingPotions') ? window.env.t('hatchingPotion') : (type == 'eggs') ? window.env.t('eggSingular') : (type == 'quests') ? window.env.t('quest') : (item.key == 'Saddle') ? window.env.t('foodSaddleText').toLowerCase() : (type == 'special') ? item.key : type; // this is ugly but temporary, once the purchase modal is done this will be removed
      var message = window.env.t('buyThis', {text: string, price: item.value, gems: gems})

      if($window.confirm(message))
        User.user.ops.purchase({params:{type:type,key:item.key}});
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

      // Selecting Pet
      } else {
        User.user.ops.equip({params:{type: 'pet', key: pet}});
      }
    }

    $scope.chooseMount = function(egg, potion) {
      User.user.ops.equip({params:{type: 'mount', key: egg + '-' + potion}});
    }

    $scope.showQuest = function(quest) {
      var item =  Content.quests[quest];
      var completedPrevious = !item.previous || (User.user.achievements.quests && User.user.achievements.quests[item.previous]);
      if (!completedPrevious)
        return alert(window.env.t('mustComplete', {quest: $rootScope.Content.quests[item.previous].text()}));
      if (item.lvl && item.lvl > user.stats.lvl)
        return alert(window.env.t('mustLevel', {level: item.lvl}));
      $rootScope.selectedQuest = item;
      $rootScope.openModal('showQuest', {controller:'InventoryCtrl'});
    }
    $scope.closeQuest = function(){
      $rootScope.selectedQuest = undefined;
    }
    $scope.questInit = function(){
      $rootScope.party.$questAccept({key:$scope.selectedQuest.key}, function(){
        $rootScope.party.$get();
      });
      $scope.closeQuest();
    }
    $scope.buyQuest = function(quest) {
      var item = Content.quests[quest];
      if (item.lvl && item.lvl > user.stats.lvl)
          return alert(window.env.t('mustLvlQuest', {level: item.lvl}));
      var completedPrevious = !item.previous || (User.user.achievements.quests && User.user.achievements.quests[item.previous]);
      if (!completedPrevious)
        return $scope.purchase("quests", item);
      $rootScope.selectedQuest = item;
      $rootScope.openModal('buyQuest', {controller:'InventoryCtrl'});
    }
  }
]);
