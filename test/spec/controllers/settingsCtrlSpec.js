'use strict';

describe('Settings Controller', function() {
  var rootScope, scope, user, User, ctrl;

  beforeEach(function() {
    module(function($provide) {
      user = specHelper.newUser();
      User = {
        set: sandbox.stub(),
        user: user
      };
      $provide.value('User', User);
      $provide.value('Guide', sandbox.stub());
    });

    inject(function(_$rootScope_, _$controller_) {
      scope = _$rootScope_.$new();
      rootScope = _$rootScope_;

      // Load RootCtrl to ensure shared behaviors are loaded
      _$controller_('RootCtrl',  {$scope: scope, User: User});

      ctrl = _$controller_('SettingsCtrl', {$scope: scope, User: User});
    });
  });

  describe('#openDayStartModal', function() {
    beforeEach(function() {
      sandbox.stub(rootScope, 'openModal');
      sandbox.stub(window, 'alert');
    });

    it('opens the day start modal', function() {
      scope.openDayStartModal(5);

      expect(rootScope.openModal).to.be.calledOnce;
      expect(rootScope.openModal).to.be.calledWith('change-day-start', {scope: scope});
    });

    it('sets nextCron variable', function() {
      expect(scope.nextCron).to.not.exist;

      scope.openDayStartModal(5);

      expect(scope.nextCron).to.exist;
    });

    it('calculates the next time cron will run', function() {
      var fakeCurrentTime = new Date(2013, 3, 1, 3, 12).getTime();
      var expectedTime = new Date(2013, 3, 1, 5, 0, 0).getTime();
      sandbox.useFakeTimers(fakeCurrentTime);

      scope.openDayStartModal(5);

      expect(scope.nextCron).to.eq(expectedTime);
    });

    it('calculates the next time cron will run and adds a day if cron would have already passed', function() {
      var fakeCurrentTime = new Date(2013, 3, 1, 8, 12).getTime();
      var expectedTime = new Date(2013, 3, 2, 5, 0, 0).getTime();
      sandbox.useFakeTimers(fakeCurrentTime);

      scope.openDayStartModal(5);

      expect(scope.nextCron).to.eq(expectedTime);
    });
  });

  describe('#saveDayStart', function() {

    it('updates user\'s custom day start and last cron', function() {
      var fakeCurrentTime = new Date(2013, 3, 1, 8, 12).getTime();
      var expectedTime = fakeCurrentTime;
      sandbox.useFakeTimers(fakeCurrentTime);
      scope.dayStart = 5;
      scope.saveDayStart();

      expect(User.set).to.be.calledOnce;
      expect(User.set).to.be.calledWith({
        'preferences.dayStart': 5,
        'lastCron': expectedTime
      });
    });
  });
});
