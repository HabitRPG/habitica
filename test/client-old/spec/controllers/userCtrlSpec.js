'use strict';

describe.only('User Controller', function() {
  var $rootScope, shared, scope, user, User, ctrl, content, achievement;

  beforeEach(function() {
    user = specHelper.newUser({
      balance: 4,
      items: {
        gear: { owned: {} },
        eggs: { Cactus: 1 },
        hatchingPotions: { Base: 1 },
        food: { Meat: 1 },
        pets: {},
        mounts: {}
      },
      flags: {
        armoireEnabled: true
      },
      preferences: {
        suppressModals: {}
      },
      purchased: {
        plan: {
          mysteryItems: [],
        },
      },
    });

    User = {
      user: user
    };

    inject(function($rootScope, $controller, Shared, User, Achievement, Guide) {
      scope = $rootScope.$new();
      Shared.wrap(user);
      shared = Shared;
      achievement = Achievement;
      User.setUser(user);
      $controller('RootCtrl',  {$scope: scope, User: User, Guide: Guide});
      ctrl = $controller('UserCtrl', {$scope: scope, User: User, Guide: Guide});
    });
  });

  describe.only('getProgressDisplay', function() {
    it('should return initial progress', function() {
      sinon.stub(content, 'loginIncentives').onFirstCall().returns({
        prevRewardKey: 0,
        nextRewardKey: 1
      });
      var actual = scope.getProgressDisplay();
      expect(actual).to.eql('');
    });
  });
});
