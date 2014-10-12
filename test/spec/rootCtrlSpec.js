'use strict';

describe('Root Controller', function() {
  var scope, user, ctrl;

  beforeEach(module('habitrpg'));
  beforeEach(inject(function($rootScope, $controller) {
    scope = $rootScope.$new();
    scope.loginUsername = 'user'
    scope.loginPassword = 'pass'
    user = specHelper.newUser();

    ctrl = $controller('RootCtrl', {$scope: scope, User: {user: user}});
  }));

  it('shows contributor level text', function(){
    expect(scope.contribText()).to.eql(undefined);
    expect(scope.contribText(null, {npc: 'NPC'})).to.eql('NPC');
    expect(scope.contribText({level: 0, text: 'Blacksmith'})).to.eql(undefined);
    expect(scope.contribText({level: 1, text: 'Blacksmith'})).to.eql('Friend Blacksmith');
    expect(scope.contribText({level: 2, text: 'Blacksmith'})).to.eql('Friend Blacksmith');
    expect(scope.contribText({level: 3, text: 'Blacksmith'})).to.eql('Elite Blacksmith');
    expect(scope.contribText({level: 4, text: 'Blacksmith'})).to.eql('Elite Blacksmith');
    expect(scope.contribText({level: 5, text: 'Blacksmith'})).to.eql('Champion Blacksmith');
    expect(scope.contribText({level: 6, text: 'Blacksmith'})).to.eql('Champion Blacksmith');
    expect(scope.contribText({level: 7, text: 'Blacksmith'})).to.eql('Legendary Blacksmith');
    expect(scope.contribText({level: 8, text: 'Blacksmith'})).to.eql('Heroic Blacksmith');
    expect(scope.contribText({level: 8, text: 'Blacksmith'}, {npc: 'NPC'})).to.eql('NPC');
  });

});