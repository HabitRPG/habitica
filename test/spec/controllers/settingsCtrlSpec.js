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
        expect(scope.popoverEl).to.exist;
        sandbox.spy($.fn, 'popover');
        scope.reroll(false);

        $.fn.popover.should.have.been.calledWith('destroy');
      });

      it('doesn\'t call reroll when not confirmed', function() {
        scope.reroll(false);
        user.ops.reroll.should.not.have.been.called;
      });

      it('calls reroll on the user when confirmed and navigates to tasks', function() {
        sandbox.stub(rootScope.$state, 'go');
        scope.reroll(true);

        user.ops.reroll.should.have.been.calledWith({});
        rootScope.$state.go.should.have.been.calledWith('tasks');
      });
    });

    describe('#clickReroll', function() {
      it('displays a confirmation popover for the user', function() {
        sandbox.spy($.fn, 'popover');
        scope.clickReroll(actionClickEvent);

        $.fn.popover.should.have.been.calledWith('destroy');
        $.fn.popover.should.have.been.called;
        $.fn.popover.should.have.been.calledWith('show');
      });
    });
  });

  context('Player Rebirth', function() {
    describe('#rebirth', function() {
      beforeEach(function() {
        scope.clickRebirth(actionClickEvent);
      });

      it('destroys the previous popover if it exists', function() {
        expect(scope.popoverEl).to.exist;
        sandbox.spy($.fn, 'popover');
        scope.rebirth(false);

        $.fn.popover.should.have.been.calledWith('destroy');
      });

      it('doesn\'t call rebirth when not confirmed', function() {
        scope.rebirth(false);
        user.ops.rebirth.should.not.have.been.called;
      });

      it('calls rebirth on the user when confirmed and navigates to tasks', function() {
        sandbox.stub(rootScope.$state, 'go');
        scope.rebirth(true);

        user.ops.rebirth.should.have.been.calledWith({});
        rootScope.$state.go.should.have.been.calledWith('tasks');
      });
    });

    describe('#clickRebirth', function() {
      it('displays a confirmation popover for the user', function() {
        sandbox.spy($.fn, 'popover');
        scope.clickRebirth(actionClickEvent);

        $.fn.popover.should.have.been.calledWith('destroy');
        $.fn.popover.should.have.been.called;
        $.fn.popover.should.have.been.calledWith('show');
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

        $.fn.popover.should.have.been.calledWith('destroy');
      });

      it('doesn\'t call any release methods if not confirmed', function() {
        var petsSpy = sandbox.spy(scope, 'releasePets');
        var mountsSpy = sandbox.spy(scope, 'releaseMounts');
        var bothSpy = sandbox.spy(scope, 'releaseBoth');

        scope.release('pets', false);
        scope.release('mounts', false);
        scope.release('both', false);
        scope.release('dummy', false);

        petsSpy.should.not.have.been.called;
        mountsSpy.should.not.have.been.called;
        bothSpy.should.not.have.been.called;
      });

      it('calls the correct release method based on it\'s input', function() {
        var petsSpy = sandbox.spy(scope, 'releasePets');
        var mountsSpy = sandbox.spy(scope, 'releaseMounts');
        var bothSpy = sandbox.spy(scope, 'releaseBoth');

        scope.release('pets', true);
        petsSpy.should.have.been.calledOnce;
        petsSpy.reset();

        scope.release('mounts', true);
        mountsSpy.should.have.been.calledOnce;
        petsSpy.should.not.have.been.called;
        mountsSpy.reset();

        scope.release('both', true);
        bothSpy.should.have.been.calledOnce;
        mountsSpy.should.not.have.been.called;
        petsSpy.should.not.have.been.called;
        bothSpy.reset();

        scope.release('dummy', true);
        petsSpy.should.not.have.been.called;
        mountsSpy.should.not.have.been.called;
        bothSpy.should.not.have.been.called;
      });
    });

    describe('#releasePets', function() {
      it('calls releasePets on the user and redirects to tasks', function() {
        sandbox.stub(rootScope.$state, 'go');
        scope.releasePets();

        user.ops.releasePets.should.have.been.calledWith({});
        rootScope.$state.go.should.have.been.calledWith('tasks');
      });
    });

    describe('#releaseMounts', function() {
      it('calls releaseMounts on the user and redirects to tasks', function() {
        sandbox.stub(rootScope.$state, 'go');
        scope.releaseMounts();

        user.ops.releaseMounts.should.have.been.calledWith({});
        rootScope.$state.go.should.have.been.calledWith('tasks');
      });
    });

    describe('#releaseBoth', function() {
      it('calls releaseBoth on the user and redirects to tasks', function() {
        sandbox.stub(rootScope.$state, 'go');
        scope.releaseBoth();

        user.ops.releaseBoth.should.have.been.calledWith({});
        rootScope.$state.go.should.have.been.calledWith('tasks');
      });
    });

    describe('#clickRelease', function() {
      it('displays a confirmation popover for the user', function() {
        sandbox.spy($.fn, 'popover');
        scope.clickRelease("dummy", actionClickEvent);

        $.fn.popover.should.have.been.calledWith('destroy');
        $.fn.popover.should.have.been.called;
        $.fn.popover.should.have.been.calledWith('show');
      });
    });
  });
});
