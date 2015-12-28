'use strict';

describe('Settings Controller', function() {
  var rootScope, scope, user, User, ctrl, actionClickEvent;

  before(function() {
    actionClickEvent = {
      target: document.createElement('button'),
    };
  });

  beforeEach(function() {
    module(function($provide) {
      user = specHelper.newUser();
      User = {
        set: sandbox.stub(),
        user: user
      };

      User.user.ops = {
        reroll: sandbox.stub(),
        rebirth: sandbox.stub(),
        releasePets: sandbox.stub(),
        releaseMounts: sandbox.stub(),
        releaseBoth: sandbox.stub(),
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

  context('Player Reroll', function() {
    describe('#reroll', function() {
      beforeEach(function() {
        scope.clickReroll(actionClickEvent);
      });

      it('destroys the previous popover if it exists', function() {
        sandbox.spy($.fn, 'popover');
        scope.reroll(false);

        expect(scope.popoverEl).to.exist;
        expect($.fn.popover).to.be.calledWith('destroy');
      });

      it('doesn\'t call reroll when not confirmed', function() {
        scope.reroll(false);
        expect(user.ops.reroll).to.not.be.calledOnce;
      });

      it('calls reroll on the user when confirmed and navigates to tasks', function() {
        sandbox.stub(rootScope.$state, 'go');
        scope.reroll(true);

        expect(user.ops.reroll).to.be.calledWith({});
        expect(rootScope.$state.go).to.be.calledWith('tasks');
      });
    });

    describe('#clickReroll', function() {
      it('displays a confirmation popover for the user', function() {
        sandbox.spy($.fn, 'popover');
        scope.clickReroll(actionClickEvent);

        expect($.fn.popover).to.be.calledWith('destroy');
        expect($.fn.popover).to.be.called;
        expect($.fn.popover).to.be.calledWith('show');
      });
    });
  });

  context('Player Rebirth', function() {
    describe('#rebirth', function() {
      beforeEach(function() {
        scope.clickRebirth(actionClickEvent);
      });

      it('destroys the previous popover if it exists', function() {
        sandbox.spy($.fn, 'popover');
        scope.rebirth(false);

        expect(scope.popoverEl).to.exist;
        expect($.fn.popover).to.be.calledWith('destroy');
      });

      it('doesn\'t call rebirth when not confirmed', function() {
        scope.rebirth(false);
        expect(user.ops.rebirth).to.not.be.calledOnce;
      });

      it('calls rebirth on the user when confirmed and navigates to tasks', function() {
        sandbox.stub(rootScope.$state, 'go');
        scope.rebirth(true);

        expect(user.ops.rebirth).to.be.calledWith({});
        expect(rootScope.$state.go).to.be.calledWith('tasks');
      });
    });

    describe('#clickRebirth', function() {
      it('displays a confirmation popover for the user', function() {
        sandbox.spy($.fn, 'popover');
        scope.clickRebirth(actionClickEvent);

        expect($.fn.popover).to.be.calledWith('destroy');
        expect($.fn.popover).to.be.called;
        expect($.fn.popover).to.be.calledWith('show');
      });
    });
  })

  context('Releasing pets and mounts', function() {
    describe('#release', function() {
      beforeEach(function() {
        scope.clickRelease('dummy', actionClickEvent);
      });

      it('destroys the previous popover if it exists', function() {
        sandbox.spy($.fn, 'popover');
        scope.release('', false);

        expect($.fn.popover).to.be.calledWith('destroy');
      });

      it('doesn\'t call any release methods if not confirmed', function() {
        var petsSpy = sandbox.spy(scope, 'releasePets');
        var mountsSpy = sandbox.spy(scope, 'releaseMounts');
        var bothSpy = sandbox.spy(scope, 'releaseBoth');

        scope.release('pets', false);
        scope.release('mounts', false);
        scope.release('both', false);
        scope.release('dummy', false);

        expect(petsSpy).to.not.be.called;
        expect(mountsSpy).to.not.be.called;
        expect(bothSpy).to.not.be.called;
      });

      it('calls the correct release method based on it\'s input', function() {
        var petsSpy = sandbox.spy(scope, 'releasePets');
        var mountsSpy = sandbox.spy(scope, 'releaseMounts');
        var bothSpy = sandbox.spy(scope, 'releaseBoth');

        scope.release('pets', true);
        expect(petsSpy).to.be.calledOnce;
        expect(mountsSpy).to.not.be.called;
        petsSpy.reset();

        scope.release('mounts', true);
        expect(mountsSpy).to.be.calledOnce;
        expect(petsSpy).to.not.be.called;
        mountsSpy.reset();

        scope.release('both', true);
        expect(petsSpy).to.not.be.called;
        expect(mountsSpy).to.not.be.called;
        expect(bothSpy).to.be.calledOnce;
        bothSpy.reset();

        scope.release('dummy', true);
        expect(petsSpy).to.not.be.called;
        expect(mountsSpy).to.not.be.called;
        expect(bothSpy).to.not.be.called;
      });
    });

    describe('#releasePets', function() {
      it('calls releasePets on the user and redirects to tasks', function() {
        sandbox.stub(rootScope.$state, 'go');
        scope.releasePets();

        expect(user.ops.releasePets).to.be.calledWith({});
        expect(rootScope.$state.go).to.be.calledWith('tasks');
      });
    });

    describe('#releaseMounts', function() {
      it('calls releaseMounts on the user and redirects to tasks', function() {
        sandbox.stub(rootScope.$state, 'go');
        scope.releaseMounts();

        expect(user.ops.releaseMounts).to.be.calledWith({});
        expect(rootScope.$state.go).to.be.calledWith('tasks');
      });
    });

    describe('#releaseBoth', function() {
      it('calls releaseBoth on the user and redirects to tasks', function() {
        sandbox.stub(rootScope.$state, 'go');
        scope.releaseBoth();

        expect(user.ops.releaseBoth).to.be.calledWith({});
        expect(rootScope.$state.go).to.be.calledWith('tasks');
      });
    });

    describe('#clickRelease', function() {
      it('displays a confirmation popover for the user', function() {
        sandbox.spy($.fn, 'popover');
        scope.clickRelease('dummy', actionClickEvent);

        expect($.fn.popover).to.be.calledWith('destroy');
        expect($.fn.popover).to.be.called;
        expect($.fn.popover).to.be.calledWith('show');
      });
    });
  });
});
