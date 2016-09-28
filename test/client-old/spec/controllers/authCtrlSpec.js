'use strict';

describe('Auth Controller', function() {
  var scope, ctrl, user, $httpBackend, $window, $modal, alert, Auth;

  beforeEach(function(){
    module(function($provide) {
      Auth = {
        runAuth: sandbox.spy(),
      };
      $provide.value('Analytics', analyticsMock);
      $provide.value('Chat', { seenMessage: function() {} });
      $provide.value('Auth', Auth);
    });

    inject(function(_$httpBackend_, $rootScope, $controller, _$modal_) {
      $httpBackend = _$httpBackend_;
      scope = $rootScope.$new();
      scope.loginUsername = 'user';
      scope.loginPassword = 'pass';
      $window = { location: { href: ""}, alert: sandbox.spy() };
      $modal = _$modal_;
      user = { user: {}, authenticate: sandbox.spy() };
      alert = { authErrorAlert: sandbox.spy() };

      ctrl = $controller('AuthCtrl', {$scope: scope, $window: $window, User: user, Alert: alert});
    })
  });

  describe('logging in', function() {
    it('should log in users with correct uname / pass', function() {
      $httpBackend.expectPOST('/api/v3/user/auth/local/login').respond({data: {id: 'abc', apiToken: 'abc'}});
      scope.auth();
      $httpBackend.flush();
      expect(Auth.runAuth).to.be.calledOnce;
      expect(alert.authErrorAlert).to.not.be.called;
    });

    it('should not log in users with incorrect uname / pass', function() {
      $httpBackend.expectPOST('/api/v3/user/auth/local/login').respond(404, '');
      scope.auth();
      $httpBackend.flush();
      expect(Auth.runAuth).to.not.be.called;
      expect(alert.authErrorAlert).to.be.calledOnce;
    });
  });

  describe('#clearLocalStorage', function () {
    var timer;

    beforeEach(function () {
      timer = sandbox.useFakeTimers();
      sandbox.stub($modal, 'open');
    });

    it('opens modal with message about clearing local storage and logging out', function () {
      scope.clearLocalStorage();

      expect($modal.open).to.be.calledOnce;
      expect($modal.open).to.be.calledWith({
        templateUrl: 'modals/message-modal.html',
        scope: scope
      });

      expect(scope.messageModal.title).to.eql(window.env.t('localStorageClearing'));
      expect(scope.messageModal.body).to.eql(window.env.t('localStorageClearingExplanation'));
    });

    it('does not call $scope.logout before 3 seconds', function () {
      sandbox.stub(scope, 'logout');

      scope.clearLocalStorage();

      timer.tick(2999);

      expect(scope.logout).to.not.be.called;
    });

    it('calls $scope.logout after 3 seconds', function () {
      sandbox.stub(scope, 'logout');

      scope.clearLocalStorage();

      timer.tick(3000);

      expect(scope.logout).to.be.calledOnce;
    });

    it('does not clear local storage before 3 seconds', function () {
      sandbox.stub(localStorage, 'clear');

      scope.clearLocalStorage();

      timer.tick(2999);

      expect(localStorage.clear).to.not.be.called;
    });

    it('clears local storage after 3 seconds', function () {
      sandbox.stub(localStorage, 'clear');

      scope.clearLocalStorage();

      timer.tick(3000);

      expect(localStorage.clear).to.be.calledOnce;
    });

    it('does not redirect to /logout route before 3 seconds', function () {
      scope.clearLocalStorage();

      timer.tick(2999);

      expect($window.location.href).to.eql('');
    });

    it('redirects to /logout after 3 seconds', function () {
      scope.clearLocalStorage();

      timer.tick(3000);

      expect($window.location.href).to.eql('/logout');
    });
  });
});
