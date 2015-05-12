'use strict';

describe('Inventory Controller', function() {
  var scope, ctrl, user, $rootScope;

  beforeEach(function() {
    module(function($provide) {
      $provide.value('User', {});
    });

    inject(function($rootScope, $controller, Shared){
      user = specHelper.newUser();
      user.balance = 4,
      user.items = {eggs: {Cactus: 1}, hatchingPotions: {Base: 1}, food: {Meat: 1}, pets: {}, mounts: {}};
      Shared.wrap(user);
      var mockWindow = {
        confirm: function(msg){
          return true;
        }
      };
      scope = $rootScope.$new();

      // Load RootCtrl to ensure shared behaviors are loaded
      $controller('RootCtrl',  {$scope: scope, User: {user: user}, $window: mockWindow});

      ctrl = $controller('InventoryCtrl', {$scope: scope, User: {user: user}, $window: mockWindow});
    });
  });

  it('starts without any item selected', function(){
    expect(scope.selectedEgg).to.eql(null);
    expect(scope.selectedPotion).to.eql(null);
    expect(scope.selectedFood.length).to.eql(0);
  });

  it('chooses an egg', function(){
    scope.chooseEgg('Cactus');
    expect(scope.selectedEgg.key).to.eql('Cactus');
  });

  it('chooses a potion', function(){
    scope.choosePotion('Base');
    expect(scope.selectedPotion.key).to.eql('Base');
  });

  it('hatches a pet', function(){
    scope.chooseEgg('Cactus');
    scope.choosePotion('Base');
    expect(user.items.eggs).to.eql({Cactus: 0});
    expect(user.items.hatchingPotions).to.eql({Base: 0});
    expect(user.items.pets).to.eql({'Cactus-Base': 5});
    expect(scope.selectedEgg).to.eql(null);
    expect(scope.selectedPotion).to.eql(null);
  });

  it('sells an egg', function(){
    scope.chooseEgg('Cactus');
    scope.sellInventory();
    expect(user.items.eggs).to.eql({Cactus: 0});
    expect(user.stats.gp).to.eql(3);
  });

  it('sells a potion', function(){
    scope.choosePotion('Base');
    scope.sellInventory();
    expect(user.items.hatchingPotions).to.eql({Base: 0});
    expect(user.stats.gp).to.eql(2);
  });

  it('sells food', function(){
    scope.chooseFood('Meat');
    scope.sellInventory();
    expect(user.items.food).to.eql({Meat: 0});
    expect(user.stats.gp).to.eql(1);
  });

  it('chooses a pet', function(){
    user.items.pets['Cactus-Base'] = 5;
    scope.choosePet('Cactus', 'Base');
    expect(user.items.currentPet).to.eql('Cactus-Base');
  });

  it('purchases an egg', inject(function(Content){
    scope.purchase('eggs', Content.eggs['Wolf']);
    expect(user.balance).to.eql(3.25);
    expect(user.items.eggs).to.eql({Cactus: 1, Wolf: 1})
  }));

  it('feeds a pet a single item', inject(function(Content){
   user.items.pets['Cactus-Base'] = 5;
   user.items.food['Meat'] = 4
   scope.chooseFood('Meat');
   scope.choosePet('Cactus', 'Base');
   scope.amounts = {};
   scope.amounts['Meat'] = 3;
   scope.feedPet();
   expect(user.items.food['Meat']).to.eql(1);
   //We can should still be active to feed more meat
   expect(scope.selectedFood.length).to.eql(1);
  }));

  it('feeds a pet multiple items', inject(function(Content){
   user.items.pets['Cactus-Base'] = 5;
   user.items.food['Meat'] = 4
   user.items.food['Chocolate'] = 3
   scope.chooseFood('Meat');
   scope.chooseFood('Chocolate');
   scope.choosePet('Cactus', 'Base');
   scope.amounts = {};
   scope.amounts['Meat'] = 3;
   scope.amounts['Chocolate'] = 3;
   scope.feedPet();
   expect(user.items.food['Meat']).to.eql(1);
   expect(user.items.food['Chocolate']).to.eql(0);
   //Since we are out of chocolate, we should ask the user to reselect
   expect(scope.selectedFood.length).to.eql(0);
  }));

});
