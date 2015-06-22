'use strict';

describe('Auth Controller', function() {

  describe('AuthCtrl', function(){
    var scope, ctrl, user, $httpBackend, $window;

    beforeEach(inject(function(_$httpBackend_, $rootScope, $controller) {
      $httpBackend = _$httpBackend_;
      scope = $rootScope.$new();
      scope.loginUsername = 'user';
      scope.loginPassword = 'pass';
      $window = { location: { href: ""}, alert: sandbox.spy() };
      user = { user: {}, authenticate: sandbox.spy() };

      ctrl = $controller('AuthCtrl', {$scope: scope, $window: $window, User: user});
    }));

    it('should log in users with correct uname / pass', function() {
      $httpBackend.expectPOST('/api/v2/user/auth/local').respond({id: 'abc', token: 'abc'});
      scope.auth();
      $httpBackend.flush();
      expect(user.authenticate).to.be.calledOnce;
      expect($window.alert).to.not.be.called;
    });

    it('should not log in users with incorrect uname / pass', function() {
      $httpBackend.expectPOST('/api/v2/user/auth/local').respond(404, '');
      scope.auth();
      $httpBackend.flush();
      expect(user.authenticate).to.not.be.called;
      expect($window.alert).to.be.calledOnce;
    });
  });

});
