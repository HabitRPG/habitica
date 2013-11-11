habitrpg.controller("PetsCtrl", ['$scope', 'User',
  function($scope, User) {

    $scope.userPets = User.user.items.pets;
    $scope.userCurrentPet = User.user.items.currentPet;
    $scope.pets = window.habitrpgShared.items.items.pets;
    $scope.hatchingPotions = window.habitrpgShared.items.items.hatchingPotions;
    $scope.totalPets = $scope.pets.length * $scope.hatchingPotions.length;

    $scope.hasPet = function(name, potion){
      if (!$scope.userPets) return false;
      return _.contains($scope.userPets, name + '-' + potion) ? true : false;
    }

    $scope.isCurrentPet = function(name, potion){
      if (!$scope.userCurrentPet || !$scope.userPets) return false;
      return $scope.userCurrentPet.str === (name + '-' + potion);
    }

    $scope.choosePet = function(name, potion){
      if($scope.userCurrentPet && $scope.userCurrentPet.str === (name + '-' + potion)){
        $scope.userCurrentPet = null;
      }else{
        var pet = _.find($scope.pets, {name: name});
        pet.modifier = potion;
        pet.str = name + '-' + potion;
        $scope.userCurrentPet = pet;
      }
      User.set('items.currentPet', $scope.userCurrentPet);
    }

  }]);