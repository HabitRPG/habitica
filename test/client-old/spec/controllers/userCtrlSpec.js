'use strict';

describe.only('User Controller', function() {
  var $rootScope, $window, User, shared, scope, ctrl, content;

  beforeEach(function() {
    module(function ($provide) {
      var user = specHelper.newUser();
      User = {user: user}
      $provide.value('Guide', sandbox.stub());
      $provide.value('User', User);
      $provide.value('Achievement', sandbox.stub());
      $provide.value('Social', sandbox.stub());
      $provide.value('Shared', {
        achievements: {
          getAchievementsForProfile: sandbox.stub()
        },
        shops: {
          getBackgroundShopSets: sandbox.stub()
        }
      });
      $provide.value('Content', {
        loginIncentives: sandbox.stub()
      })
    });

    inject(function($rootScope, $controller, User, Content) {
      scope = $rootScope.$new();
      content = Content;
      $window = {
        env: {
          t: sandbox.stub(),
        },
      };
      $controller('RootCtrl', { $scope: scope, $window: $window, User: User});
      ctrl = $controller('UserCtrl', { $scope: scope, User: User, $window: $window});
    });
  });

  describe('getProgressDisplay', function() {
    it('should return initial progress', function() {
      $window.env.t.onFirstCall().returns('');
      scope.profile.loginIncentives = 0;
      content.loginIncentives = [{
        nextRewardAt: 1,
        reward: true
      }];
      var actual = scope.getProgressDisplay();
      expect(actual.trim()).to.eql('0/1');
    });

    it('should return progress between next reward and current reward', function() {
      $window.env.t.onFirstCall().returns('');
      scope.profile.loginIncentives = 1;
      content.loginIncentives = [{
        nextRewardAt: 1,
        reward: true
      }, {
        prevRewardAt: 0,
        nextRewardAt: 2,
        reward: true
      }, {
        prevRewardAt: 1,
        nextRewardAt: 3
      }];
      var actual = scope.getProgressDisplay();
      expect(actual.trim()).to.eql('0/1');
    });
  });
});
