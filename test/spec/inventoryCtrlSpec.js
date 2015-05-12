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

  describe('gear sorting', function() {
    var specialWeapon, rogueArmor, wizardWeaponOne;

    beforeEach(function() {

      inject(function(){
        scope.gear = [];
        //We should some how grab from the actual data instead of creating fake data. This doesn't test that are data structures are stable
        specialWeapon = {text: env.t('weaponSpecial0Text'), notes:env.t('weaponSpecial0Notes', {str: 20}), str: 20, value:150, type:"weapon", color:"silver", klass:"none"};
        rogueArmor = {text: env.t('armorRogue1Text'), notes: env.t('armorRogue1Notes', {per: 6}), per: 6, value:30, color: "brown", type:"armor", klass:"rogue"};
        wizardWeaponOne = {twoHanded: true, text: env.t('weaponWizard1Text'), notes: env.t('weaponWizard1Notes', {int: 3, per: 1}), int: 3, per: 1, value:30, type:"weapon", klass:"mage", color:"green"};
        scope.gear.push(specialWeapon);
        scope.gear.push(rogueArmor);
        scope.gear.push(wizardWeaponOne);
      });
    });

    it('sorts equipment by type', inject(function(){
      //Equipment Sort
      scope.groupEquipmentBy('type');
      expect(scope.equipment).to.eql({"Armor": [rogueArmor], "Weapon": [specialWeapon, wizardWeaponOne]});
    }));

    it('sorts equipment by color', inject(function(){

      scope.groupEquipmentBy('color');
      expect(scope.equipment).to.eql({"silver": [specialWeapon],"brown": [rogueArmor], "green": [wizardWeaponOne]});
     }));

     it('sorts equipment by stat', inject(function(){
      scope.groupEquipmentBy('stat');
      expect(scope.equipment).to.eql({"Strength": [specialWeapon],"Perception": [rogueArmor, wizardWeaponOne], "Intelligence": [wizardWeaponOne]});
     }));

     it('sorts equipment by klass', inject(function(){
      scope.groupEquipmentBy('klass');
      expect(scope.equipment).to.eql({"None": [specialWeapon],"Rogue": [rogueArmor], "Mage":[wizardWeaponOne]});
     }));

     it('sorts costume by type', inject(function(){
      //Costume Sorts
      scope.groupEquipmentBy('type', 1);
      expect(scope.costume).to.eql({Armor: [rogueArmor], "Weapon": [specialWeapon, wizardWeaponOne]});
     }));

     it('sorts costume by color', inject(function(){
      scope.groupEquipmentBy('color', 1);
      expect(scope.costume).to.eql({"silver": [specialWeapon],"brown": [rogueArmor], "green": [wizardWeaponOne]});
     }));

     it('sorts costume by stat', inject(function(){
      scope.groupEquipmentBy('stat', 1);
      expect(scope.costume).to.eql({"Strength": [specialWeapon],"Perception": [rogueArmor, wizardWeaponOne], "Intelligence": [wizardWeaponOne]});
     }));

     it('sorts costume by klass', inject(function(){
      scope.groupEquipmentBy('klass', 1);
      expect(scope.costume).to.eql({"None": [specialWeapon],"Rogue": [rogueArmor], "Mage":[wizardWeaponOne]});
    }));

   });//End of describe gear sorting

});
