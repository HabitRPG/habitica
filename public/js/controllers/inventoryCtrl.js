habitrpg.controller("InventoryCtrl", ['$rootScope', '$scope', 'User', 'API_URL', '$http', 'Notification',
  function($rootScope, $scope, User, API_URL, $http, Notification) {

    var user = User.user;
    var Content = $rootScope.Content;

    // convenience vars since these are accessed frequently

    $scope.selectedEgg = null; // {index: 1, name: "Tiger", value: 5}
    $scope.selectedPotion = null; // {index: 5, name: "Red", value: 3}
    $scope.totalPets = _.size(Content.eggs) * _.size(Content.hatchingPotions);

    // count egg, food, hatchingPotion stack totals
    var countStacks = function(items) { return _.reduce(items,function(m,v){return m+v;},0);}

    $scope.$watch('user.items.mounts', function(mounts){ $scope.mountCount = $rootScope.countExists(mounts); }, true);
    $scope.$watch('user.items.eggs', function(eggs){ $scope.eggCount = countStacks(eggs); }, true);
    $scope.$watch('user.items.hatchingPotions', function(pots){ $scope.potCount = countStacks(pots); }, true);
    $scope.$watch('user.items.food', function(food){ $scope.foodCount = countStacks(food); }, true);

    $scope.$watch('user.items.gear', function(gear){
      $scope.gear = {
        base: _.where(Content.gear.flat, {klass: 'base'})
      };
      _.each(gear.owned, function(bool,key){
        var item = Content.gear.flat[key];
        if (!$scope.gear[item.klass]) $scope.gear[item.klass] = [];
        $scope.gear[item.klass].push(item);
      })
    }, true)

    $scope.chooseEgg = function(egg){
      if ($scope.selectedEgg && $scope.selectedEgg.name == egg) {
        return $scope.selectedEgg = null; // clicked same egg, unselect
      }
      var eggData = _.findWhere(Content.eggs, {name:egg});
      if (!$scope.selectedPotion) {
        $scope.selectedEgg = eggData;
      } else {
        $scope.hatch(eggData, $scope.selectedPotion);
      }
    }

    $scope.choosePotion = function(potion){
      if ($scope.selectedPotion && $scope.selectedPotion.name == potion) {
        return $scope.selectedPotion = null; // clicked same egg, unselect
      }
      // we really didn't think through the way these things are stored and getting passed around...
      var potionData = _.findWhere(Content.hatchingPotions, {name:potion});
      if (!$scope.selectedEgg) {
        $scope.selectedPotion = potionData;
      } else {
        $scope.hatch($scope.selectedEgg, potionData);
      }
    }

    $scope.chooseFood = function(food){
      if ($scope.selectedFood && $scope.selectedFood.name == food) return $scope.selectedFood = null;
      $scope.selectedFood = Content.food[food];
    }

    $scope.sellInventory = function() {
      var selected = $scope.selectedEgg ? 'selectedEgg' : $scope.selectedPotion ? 'selectedPotion' : $scope.selectedFood ? 'selectedFood' : undefined;
      if (selected) {
        var type = $scope.selectedEgg ? 'eggs' : $scope.selectedPotion ? 'hatchingPotions' : $scope.selectedFood ? 'food' : undefined;
        user.ops.sell({query:{type:type, key: $scope[selected].name}});
        if (user.items[type][$scope[selected].name] < 1) {
          $scope[selected] = null;
        }
      }
    }

    $scope.ownedItems = function(inventory){
      return _.pick(inventory, function(v,k){return v>0;});
    }

    $scope.hatch = function(egg, potion){
      user.ops.hatch({query:{egg:egg.name, hatchingPotion:potion.name}});
      $scope.selectedEgg = null;
      $scope.selectedPotion = null;
    }

    $scope.buy = function(type, item){
      var gems = User.user.balance * 4;
      if(gems < item.value) return $rootScope.modals.buyGems = true;
      var string = (type == 'hatchingPotion') ? 'hatching potion' : type; // give hatchingPotion a space
      var message = "Buy this " + string + " with " + item.value + " of your " + gems + " Gems?"
      if(confirm(message)){
        $http.post(API_URL + '/api/v1/market/buy?type=' + type, item)
          .success(function(data){
            User.user.items = data.items;
          });
      }
    }

    $scope.choosePet = function(egg, potion){
      var pet = egg + '-' + potion;

      // Feeding Pet
      if ($scope.selectedFood) {
        var food = $scope.selectedFood
        if (food.name == 'Saddle' && !confirm('Saddle ' + pet + '?')) return;
        if (!confirm('Feed ' + pet + ' a ' + food.name + '?')) return;
        User.user.ops.feed({query:{pet: pet, food: food.name}});
        $scope.selectedFood = null;

      // Selecting Pet
      } else {
        User.user.ops.equip({query:{type: 'pet', key: pet}});
      }
    }

    $scope.chooseMount = function(egg, potion) {
      User.user.ops.equip({query:{type: 'mount', key: egg + '-' + potion}});
    }
  }
]);