habitrpg.controller("MarketCtrl", ['$rootScope', '$scope', 'User', 'API_URL', '$http',
  function($rootScope, $scope, User, API_URL, $http) {

  	$scope.eggs = window.habitrpgShared.items.items.pets;
  	$scope.hatchingPotions = window.habitrpgShared.items.items.hatchingPotions;
    $scope.userEggs = User.user.items.eggs;
    $scope.userHatchingPotions = User.user.items.hatchingPotions;

  	$scope.buy = function(type, item){
  		var gems = User.user.balance * 4,
  				store = type === 'egg' ? $scope.userEggs : $scope.userHatchingPotions,
  				storePath = type === 'egg' ? 'items.eggs' : 'items.hatchingPotions'

  		if(gems < item.value){
  			return $rootScope.modals.moreGems = true;
  		}

  		var message = "Buy this " + (type == 'egg' ? 'egg' : 'hatching potion') + " with " + item.value + " of your " + gems + " Gems?"
  		
  		if(confirm(message)){
  			var toPush = type === 'egg' ? item : item.name;
        $http.post(API_URL + '/api/v1/market/buy?type=' + type, toPush)
          .success(function(data){
            User.user.balance = data.balance;
            store.push(toPush);
            //$sc¡ope.items = data.items.eggs; // FIXME this isn't updating the UI
          }).error(function(data){
            alert(data);
            console.error(data);
          });
  		}
  	}

  }]);