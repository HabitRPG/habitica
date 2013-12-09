habitrpg.controller("InventoryCtrl", ['$rootScope', '$scope', 'User', 'API_URL', '$http', 'Notification',
  function($rootScope, $scope, User, API_URL, $http, Notification) {

    var user = User.user;
    var Items = window.habitrpgShared.items;

    // convenience vars since these are accessed frequently

    $scope.selectedEgg = null; // {index: 1, name: "Tiger", value: 5}
    $scope.selectedPotion = null; // {index: 5, name: "Red", value: 3}
    $scope.totalPets = _.size($scope.Items.eggs) * _.size($scope.Items.hatchingPotions);

    // count egg, food, hatchingPotion stack totals
    var countStacks = function(items) { return _.reduce(items,function(m,v){return m+v;},0);}

    $scope.$watch('user.items.mounts', function(mounts){ $scope.mountCount = $rootScope.countExists(mounts); }, true);
    $scope.$watch('user.items.eggs', function(eggs){ $scope.eggCount = countStacks(eggs); }, true);
    $scope.$watch('user.items.hatchingPotions', function(pots){ $scope.potCount = countStacks(pots); }, true);
    $scope.$watch('user.items.food', function(food){ $scope.foodCount = countStacks(food); }, true);

    $scope.$watch('user.items.gear', function(gear){
      $scope.gear = {
        base: _.where(Items.items.gear.flat, {klass: 'base'})
      };
      _.each(gear.owned, function(bool,key){
        var item = Items.items.gear.flat[key];
        if (!$scope.gear[item.klass]) $scope.gear[item.klass] = [];
        $scope.gear[item.klass].push(item);
      })
    }, true)

    $scope.chooseEgg = function(egg){
      if ($scope.selectedEgg && $scope.selectedEgg.name == egg) {
        return $scope.selectedEgg = null; // clicked same egg, unselect
      }
      var eggData = _.findWhere(Items.items.eggs, {name:egg});
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
      var potionData = _.findWhere(Items.items.hatchingPotions, {name:potion});
      if (!$scope.selectedEgg) {
        $scope.selectedPotion = potionData;
      } else {
        $scope.hatch($scope.selectedEgg, potionData);
      }
    }

    $scope.chooseFood = function(food){
      if ($scope.selectedFood && $scope.selectedFood.name == food) return $scope.selectedFood = null;
      $scope.selectedFood = $scope.Items.food[food];
    }

    $scope.sellInventory = function() {
      // TODO DRY this
      if ($scope.selectedEgg) {
        user.items.eggs[$scope.selectedEgg.name]--;
        User.setMultiple({
          'items.eggs': user.items.eggs,
          'stats.gp': User.user.stats.gp + $scope.selectedEgg.value
        });
        if (user.items.eggs[$scope.selectedEgg.name] < 1) {
            $scope.selectedEgg = null;
        }

      } else if ($scope.selectedPotion) {
        user.items.hatchingPotions[$scope.selectedPotion.name]--;
        User.setMultiple({
          'items.hatchingPotions': user.items.hatchingPotions,
          'stats.gp': User.user.stats.gp + $scope.selectedPotion.value
        });
        if (user.items.hatchingPotions[$scope.selectedPotion.name] < 1) {
            $scope.selectedPotion = null;
        }

      } else if ($scope.selectedFood) {
        user.items.food[$scope.selectedFood.name]--;
        User.setMultiple({
          'items.food': user.items.food,
          'stats.gp': User.user.stats.gp + $scope.selectedFood.value
        });
        if (user.items.food[$scope.selectedFood.name] < 1) {
            $scope.selectedFood = null;
        }
      }

    }

    $scope.ownedItems = function(inventory){
      return _.pick(inventory, function(v,k){return v>0;});
    }

    $scope.hatch = function(egg, potion){
      var pet = egg.name+"-"+potion.name;
      if (user.items.pets[pet])
        return alert("You already have that pet. Try hatching a different combination!");

      var setObj = {};
      setObj['items.pets.' + pet] = 5;
      setObj['items.eggs.' + egg.name] = user.items.eggs[egg.name] - 1;
      setObj['items.hatchingPotions.' + potion.name] = user.items.hatchingPotions[potion.name] - 1;

      User.setMultiple(setObj);

      alert("Your egg hatched! Visit your stable to equip your pet.");

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
        if (window.habitrpgShared.items.items.specialPets[pet]) return Notification.text("Can't feed this pet.");
        var setObj = {};
        var userPets = user.items.pets;
        if (user.items.mounts[pet] && (userPets[pet] >= 50 || $scope.selectedFood.name == 'Saddle'))
          return Notification.text("You already have that mount");

        var evolve = function(){
          userPets[pet] = 0;
          setObj['items.mounts.' + pet] = true;
          if (pet == user.items.currentPet) setObj['items.currentPet'] = '';
          Notification.text('You have tamed '+egg+", let's go for a ride!");
        }
        // Saddling a pet
        if ($scope.selectedFood.name == 'Saddle') {
          if (!confirm('Saddle ' + pet + '?')) return;
          evolve();
        } else {
          if (!confirm('Feed ' + pet + ' a ' + $scope.selectedFood.name + '?')) return;
          if ($scope.selectedFood.target == potion) {
            userPets[pet] += 5;
            Notification.text(egg+' really likes the '+$scope.selectedFood.name+'!');
          } else {
            userPets[pet] += 2;
            Notification.text(egg+' eats the '+$scope.selectedFood.name+" but doesn't seem to enjoy it.");
          }
          if (userPets[pet] >= 50 && !user.items.mounts[pet]) evolve();
        }
        setObj['items.pets.' + pet] = userPets[pet];
        setObj['items.food.' + $scope.selectedFood.name] = user.items.food[$scope.selectedFood.name] - 1;
        User.setMultiple(setObj);
        $scope.selectedFood = null;

      // Selecting Pet
      } else {
        var userCurrentPet = User.user.items.currentPet;
        if(userCurrentPet && userCurrentPet == pet){
          User.user.items.currentPet = '';
        }else{
          User.user.items.currentPet = pet;
        }
        User.set('items.currentPet', User.user.items.currentPet);
      }
    }

    $scope.chooseMount = function(egg, potion) {
      var mount = egg + '-' + potion;
      User.set('items.currentMount', (user.items.currentMount == mount) ? '' : mount);
    }

    $scope.equip = function(user, item, costume) {
      var equipTo = costume ? 'costume' : 'equipped';
      if (item.type == 'shield') {
        var weapon = Items.items.gear.flat[user.items.gear[equipTo].weapon];
        if (weapon && weapon.twoHanded) return Notification.text(weapon.text + ' is two-handed');
      }
      var setVars = {};
      setVars['items.gear.' +  equipTo + '.' + item.type] = item.key;
      if (item.twoHanded)
        setVars['items.gear.' + equipTo + '.shield'] = 'warrior_shield_0';
      User.setMultiple(setVars);
    }

  }
]);