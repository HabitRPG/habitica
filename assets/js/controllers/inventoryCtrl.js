habitrpg.controller("InventoryCtrl", ['$scope', 'User',
  function($scope, User) {

    $scope.hatching = false;
    $scope.userEggs = User.user.items.eggs;
    $scope.userHatchingPotions = User.user.items.hatchingPotions;

  }]);