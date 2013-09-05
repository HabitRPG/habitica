habitrpg.controller("MarketCtrl", ['$rootScope', '$scope', 'User',
  function($rootScope, $scope, User) {

  	User.set('balance', 4);

  	$scope.eggs = window.habitrpgShared.items.items.pets;
  	$scope.hatchingPotions = window.habitrpgShared.items.items.hatchingPotions;
    $scope.userEggs = User.user.items.eggs;
    $scope.userHatchingPotions = User.user.items.hatchingPotions;

  	$scope.buy = function(type, item){
  		var gems = User.user.balance * 4,
  				store = type === 'egg' ? $scope.userEggs : $scope.userHatchingPotions;
  				storePath = type === 'egg' ? 'items.eggs' : 'items.hatchingPotions'

  		if(gems < item.value){
  			return $rootScope.modals.moreGems = true;
  		}

  		var message = "Buy this " + (type == 'egg' ? 'egg' : 'hatching potion') + " with " + item.value + " of your " + gems + " Gems?"
  		
  		if(confirm(message)){
  			var toPush = type === 'egg' ? item : item.name;
  			store.push(toPush);

  			var dataStore = {
  				op: 'set',
  				data: {}
  			};

  			dataStore.data[storePath] = store;

  			User.log([
  				dataStore,
        	{ op: 'set', data: {'balance': (gems - item.value) / 4} }
  			]);
  		}
  	}

  }]);