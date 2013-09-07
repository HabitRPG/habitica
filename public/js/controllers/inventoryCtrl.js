habitrpg.controller("InventoryCtrl", ['$scope', 'User',
  function($scope, User) {

    $scope.hatching = false;
    $scope.userEggs = User.user.items.eggs;
    $scope.userHatchingPotions = User.user.items.hatchingPotions;

    $scope.chooseEgg = function(egg){
      if($scope.userHatchingPotions && $scope.userHatchingPotions.length < 1) {
        return alert("You have no hatching potion!");
      }

      $scope.selectedEgg = egg;
      $scope.selectedPotion = $scope.userHatchingPotions[0];
      $scope.hatching = true;
    }

    $scope.pour = function(){
      var i = _.indexOf($scope.userEggs, $scope.selectedEgg);
      $scope.userEggs.splice(i, 1);

      i = _.indexOf($scope.userHatchingPotions, $scope.selectedPotion);
      $scope.userHatchingPotions.splice(i, 1);

      var pet = $scope.selectedEgg.name + '-' + $scope.selectedPotion;

      if(User.user.items.pets && User.user.items.pets.indexOf(pet) != -1) {
        return alert("You already have that pet, hatch a different combo.")
      }

      if(!User.user.items.pets) User.user.items.pets = [];
      User.user.items.pets.push(pet);

      User.log([
        { op: 'set', data: {'items.pets': User.user.items.pets} },
        { op: 'set', data: {'items.eggs': $scope.userEggs} },
        { op: 'set', data: {'items.hatchingPotions': $scope.userHatchingPotions} }
      ]);

      alert("Your egg hatched! Visit your stable to equip your pet.");

      $scope.selectedEgg = null;
      $scope.hatching = false;
    }

  }]);