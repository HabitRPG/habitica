'use strict';

describe('Auth Controller', function() {

  beforeEach(module('habitrpg'));

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
      $httpBackend.expectPOST('/api/v1/user/auth/local').respond({id: 'abc', token: 'abc'});
      scope.auth();
      $httpBackend.flush();
      expect(user.authenticate).to.have.been.calledOnce;
      expect($window.alert).to.not.have.been.called;
    });

    it('should not log in users with incorrect uname / pass', function() {
      $httpBackend.expectPOST('/api/v1/user/auth/local').respond(404, '');
      scope.auth();
      $httpBackend.flush();
      expect(user.authenticate).to.not.have.been.called;
      expect($window.alert).to.have.been.calledOnce;
    });
  });

});