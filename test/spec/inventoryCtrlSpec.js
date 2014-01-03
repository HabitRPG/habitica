'use strict';

describe('Inventory Controller', function() {
  var scope, ctrl;

  beforeEach(module('habitrpg'));
  beforeEach(inject(function($rootScope, $controller){
    var user = {};
    scope = $rootScope.$new();
    $rootScope.Content = window.habitrpgShared.content;
    ctrl = $controller('InventoryCtrl', {$scope: scope, User: user});
  }));

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
});
