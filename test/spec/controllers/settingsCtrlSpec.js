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

  describe('common tests', function () {
    function alertTest(fnName, tKey) {
      scope[fnName]();
      expect(window.confirm).to.be.calledWith(window.env.t(tKey));
    }

    function notConfirmedTest(fnName) {
      window.confirm.returns(false);
      scope[fnName]();
      expect(user.ops[fnName]).to.not.be.called;
      expect(scope.$close).to.not.be.called;
    }

    function confirmedTest(fnName) {
      window.confirm.returns(true);
      scope[fnName]();
      var op = user.ops[fnName];
      expect(op).to.be.calledOnce;
      expect(scope.$close).to.be.calledAfter(op);
    }

    beforeEach(function() {
      sandbox.stub(window, 'confirm');
      scope.$close = sinon.stub();
    });

    describe('#releasePets', function() {

      beforeEach(function() {
        user.ops = {
          releasePets: sandbox.stub()
        };
      });

      it('displays alert if pets are released', function() {
        alertTest('releasePets', 'petKeyPetsSure');
      });

      it('does not release pets if not confirmed', function() {
        notConfirmedTest('releasePets');
      });

      it('releases pets if confirmed', function() {
        confirmedTest('releasePets');
      });
    });

    describe('#releaseMounts', function() {

      beforeEach(function() {
        user.ops = {
          releaseMounts: sandbox.stub()
        };
      });

      it('displays alert if mounts are released', function() {
        alertTest('releaseMounts', 'petKeyMountsSure');
      });

      it('does not release mounts if not confirmed', function() {
        notConfirmedTest('releaseMounts');
      });

      it('releases mounts if confirmed', function() {
        confirmedTest('releaseMounts');
      });
    });

    describe('#releaseBoth', function() {

      beforeEach(function() {
        user.ops = {
          releaseBoth: sandbox.stub()
        };
      });

      it('displays alert if both pets and mounts are released', function() {
        alertTest('releaseBoth', 'petKeyBothSure');
      });

      it('does not release both pets and mounts if not confirmed', function() {
        notConfirmedTest('releaseBoth');
      });

      it('releases both pets and mounts if confirmed', function() {
        confirmedTest('releaseBoth');
      });
    });

    describe('#rebirth', function() {

      beforeEach(function () {
        user.ops = {
          rebirth: sinon.stub()
        };
      });

      it('displays alert if orb of rebirth is bought', function() {
        alertTest('rebirth', 'rebirthSure');
      });

      it('does not process rebirth if not confirmed', function() {
        notConfirmedTest('rebirth');
      });

      it('processes rebirth if confirmed', function() {
        confirmedTest('rebirth');
      });
    });

    describe('#reroll', function() {

      beforeEach(function () {
        user.ops = {
          reroll: sinon.stub()
        };
      });

      it('displays alert if fortify potion is bought', function() {
        alertTest('reroll', 'fortifySure');
      });

      it('does not reroll if not confirmed', function() {
        notConfirmedTest('reroll');
      });

      it('rerolls if confirmed', function() {
        confirmedTest('reroll');
      });
    });
  });
});
