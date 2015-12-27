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

      User.user.ops = {
        reroll: sandbox.stub(),
        rebirth: sandbox.stub(),
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

  describe('#reroll', function() {
    beforeEach(function() {
      scope.clickReroll(document.createElement('div'));
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
      scope.clickReroll(document.createElement('div'));

      $.fn.popover.should.have.been.calledWith('destroy');
      $.fn.popover.should.have.been.called;
      $.fn.popover.should.have.been.calledWith('show');
    });
  });

  describe('#rebirth', function() {
    beforeEach(function() {
      scope.clickRebirth(document.createElement('div'));
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
      scope.clickRebirth(document.createElement('div'));

      $.fn.popover.should.have.been.calledWith('destroy');
      $.fn.popover.should.have.been.called;
      $.fn.popover.should.have.been.calledWith('show');
    });
  });

});
