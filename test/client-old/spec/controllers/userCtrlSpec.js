'use strict';

describe('User Controller', function() {
  var $rootScope, shared, scope, user, User, ctrl, content;

  beforeEach(function() {
    user = specHelper.newUser();
    User = {
      user: user
    };

    module(function($provide) {
      $provide.value('User', User);
      $provide.value('Guide', {});
    });

    inject(function($rootScope, $controller, Shared, Content){
      scope = $rootScope.$new();
      Shared.wrap(user);
      shared = Shared;
      content = Content
      $controller('RootCtrl',  {$scope: scope, User: User, Shared: Shared});
      ctrl = $controller('UserCtrl', {$scope: scope, User: User});
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
