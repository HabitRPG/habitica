'use strict';

describe('Auth Controller', function() {

  beforeEach(module('habitrpgStatic'));

  describe('AuthCtrl', function(){
    var scope, ctrl, user, $httpBackend, $window;

    beforeEach(inject(function(_$httpBackend_, $rootScope, $controller) {
      $httpBackend = _$httpBackend_;
      scope = $rootScope.$new();
      scope.loginUsername = 'user'
      scope.loginPassword = 'pass'
      $window = { location: { href: ""}, alert: sinon.spy() };
      user = { user: {}, authenticate: sinon.spy() };

      ctrl = $controller('AuthCtrl', {$scope: scope, $window: $window, User: user});
    }));

    it('should log in users with correct uname / pass', function() {
      $httpBackend.expectPOST('/api/v2/user/auth/local').respond({id: 'abc', token: 'abc'});
      scope.auth();
      $httpBackend.flush();
      sinon.assert.calledOnce(user.authenticate);
      sinon.assert.notCalled($window.alert);
    });

    it('should not log in users with incorrect uname / pass', function() {
      $httpBackend.expectPOST('/api/v2/user/auth/local').respond(404, '');
      scope.auth();
      $httpBackend.flush();
      sinon.assert.notCalled(user.authenticate);
      sinon.assert.calledOnce($window.alert);
    });
  });

});
