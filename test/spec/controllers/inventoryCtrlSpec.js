'use strict';

describe('Inventory Controller', function() {
  var scope, ctrl, user, $rootScope;

  beforeEach(function() {
    module(function($provide) {
      $provide.value('User', {});
    });

    inject(function($rootScope, $controller, Shared){
      user = specHelper.newUser();
      user.balance = 4;
      user.items.eggs = {Cactus: 1};
      user.items.hatchingPotions = {Base: 1};
      user.items.food = {Meat: 1};
      user.items.pets = {}
      user.items.mounts = {};
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
    expect(scope.selectedFood).to.eql(undefined);
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

  describe('Deselecting Items', function() {
    it('deselects a food', function(){
      scope.chooseFood('Meat');
      scope.deselectItem();
      expect(scope.selectedFood).to.eql(null);
    });

    it('deselects a potion', function(){
      scope.choosePotion('Base');
      scope.deselectItem();
      expect(scope.selectedPotion).to.eql(null);
    });

    it('deselects a egg', function(){
      scope.chooseEgg('Cactus');
      scope.deselectItem();
      expect(scope.selectedEgg).to.eql(null);
    });
  });
});
