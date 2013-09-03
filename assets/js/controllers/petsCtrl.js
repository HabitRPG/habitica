habitrpg.controller("PetsCtrl", ['$scope', '$rootScope', 'User',
  function($scope, $rootScope, User) {

    var user = $rootScope.user;

    $scope.userPets = user.items.pets;
    $scope.userCurrentPet = user.items.currentPet;
    $scope.pets = window.habitrpgShared.items.items.pets;
    $scope.hatchingPotions = window.habitrpgShared.items.items.hatchingPotions;

    $scope.hasPet = function(name, potion){
      if (!$scope.userPets) return false;
      return _.contains($scope.userPets, name + '-' + potion) ? true : false;
    }

    $scope.isCurrentPet = function(name, potion){
      if (!$scope.userCurrentPet || !$scope.userPets) return false;
      return $scope.userCurrentPet.str === (name + '-' + potion);
    }

    $scope.choosePet = function(name, potion){
      console.log(user.items.currentPet);
      if($scope.userCurrentPet && $scope.userCurrentPet.str === (name + '-' + potion)){
        $scope.userCurrentPet = null;
        User.log({op:'set', data:{'items.currentPet': $scope.userCurrentPet}});
      }else{
        var pet = _.find($scope.pets, {name: name});
        console.log(pet, {name: $scope.pets});
        pet.modifier = potion;
        pet.str = name + '-' + potion;
        $scope.userCurrentPet = pet;
        User.log({op:'set', data:{'items.currentPet': $scope.userCurrentPet}});
      }
      // Changes doesn't propagate!!! here the console log for 'user.items.currentPet' the old value and
      // for '$scope.userCurrentPet' the new one
      console.log(user.items.currentPet, $scope.userCurrentPet);
    }

  }]);