habitrpg.controller("InventoryCtrl", ['$rootScope', '$scope', 'User', 'API_URL', '$http', 'Notification',
  function($rootScope, $scope, User, API_URL, $http, Notification) {

    var user = User.user;
    var Content = $rootScope.Shared.content;

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
        base: _.where(shared.content.gear.flat, {klass: 'base'})
      };
      _.each(gear.owned, function(bool,key){
        var item = shared.content.gear.flat[key];
        if (!$scope.gear[item.klass]) $scope.gear[item.klass] = [];
        $scope.gear[item.klass].push(item);
      })
    }, true)

    $scope.chooseEgg = function(egg){
      if ($scope.selectedEgg && $scope.selectedEgg.name == egg) {
        return $scope.selectedEgg = null; // clicked same egg, unselect
      }
      var eggData = _.findWhere(shared.content.eggs, {name:egg});
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
      var potionData = _.findWhere(shared.content.hatchingPotions, {name:potion});
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
      user.ops.hatch({query:{egg:egg.name, hatchingPotion:potion.name}}, function(err, req){
        // Bypassing the UserServices-injected callback so we can only show alert on success. It's safe, since this means
        // UserServices callback will be 3rd param and never get called
        if (err) return Notification.text(err);
        User.log({op:'hatch', query:req.query});
        Notification.text("Your egg hatched! Visit your stable to equip your pet.");
        $scope.selectedEgg = null;
        $scope.selectedPotion = null;
      });
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
        if (window.habitrpgShared.shared.content.specialPets[pet]) return Notification.text("Can't feed this pet.");
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
        User.set(setObj);
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
  }
]);