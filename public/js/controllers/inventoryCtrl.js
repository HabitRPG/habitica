habitrpg.controller("InventoryCtrl", ['$scope', 'User',
  function($scope, User) {

    // convenience vars since these are accessed frequently
    $scope.userEggs = User.user.items.eggs;
    $scope.userHatchingPotions = User.user.items.hatchingPotions;

    $scope.chooseEgg = function(egg){
      if (!$scope.selectedPotion) {
        $scope.selectedEgg = egg.name;
      } else {
        $scope.hatch(egg, $scope.selectedPotion);
      }
    }

    $scope.choosePotion = function(potion){
      if (!$scope.selectedEgg) {
        $scope.selectedPotion = potion;
      } else {
        $scope.hatch($scope.selectedEgg, potion);
      }
    }

    $scope.ownsPet = function(egg, potion){
      if (!egg || !potion) return;
      var pet = egg + '-' + potion;
      return User.user.items.pets && ~User.user.items.pets.indexOf(pet)
    }

    $scope.selectableInventory = function(egg, potion) {
      if (!egg || !potion) return;
      if (!$scope.ownsPet(egg, potion)) return 'selectableInventory';
    }

    $scope.hatch = function(egg, potion){
      var pet = $scope.selectedEgg + '-' + $scope.selectedPotion;
      if ($scope.ownsPet(egg, potion)){
        return alert("You already have that pet, hatch a different combo.")
      }
      var i = _.indexOf($scope.userEggs, $scope.selectedEgg);
      $scope.userEggs.splice(i, 1);

      i = _.indexOf($scope.userHatchingPotions, $scope.selectedPotion);
      $scope.userHatchingPotions.splice(i, 1);

      if(!User.user.items.pets) User.user.items.pets = [];
      User.user.items.pets.push(pet);

      User.log([
        { op: 'set', data: {'items.pets': User.user.items.pets} },
        { op: 'set', data: {'items.eggs': $scope.userEggs} },
        { op: 'set', data: {'items.hatchingPotions': $scope.userHatchingPotions} }
      ]);

      alert("Your egg hatched! Visit your stable to equip your pet.");

      $scope.selectedEgg = null;
      $scope.selectedPotion = null;
    }

  }]);