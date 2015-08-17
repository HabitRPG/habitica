'use strict';

describe('Analytics Service', function () {
  var analytics, user, clock;

  beforeEach(function() {
    clock = sandbox.useFakeTimers();
    sandbox.stub(window, 'refresher', function(){return true});
    user = specHelper.newUser({
      contributor: {},
      purchased: { plan: {} },
    });
    user.flags.tour = { intro: null };

    module(function($provide) {
      $provide.value('User', {user: user});
    });

    inject(function(Analytics) {
      analytics = Analytics;
    });
  });

  context('functions', function() {

    describe('register', function() {

      beforeEach(function() {
        sandbox.stub(amplitude, 'setUserId');
        sandbox.stub(window, 'ga');
      });

      it('sets up user with Amplitude', function() {
        analytics.register();
        clock.tick();
        expect(amplitude.setUserId).to.have.been.calledOnce;
        expect(amplitude.setUserId).to.have.been.calledWith(user._id);
      });

      it('sets up user with Google Analytics', function() {
        analytics.register();
        clock.tick();
        expect(ga).to.have.been.calledOnce;
        expect(ga).to.have.been.calledWith('set', {userId: user._id});
      });
    });

    describe('login', function() {

      beforeEach(function() {
        sandbox.stub(amplitude, 'setUserId');
        sandbox.stub(window, 'ga');
      });

      it('sets up tracking for amplitude', function() {
        analytics.login();
        clock.tick();

        expect(amplitude.setUserId).to.have.been.calledOnce;
        expect(amplitude.setUserId).to.have.been.calledWith(user._id);
      });

      it('sets up tracking for google analytics', function() {
        analytics.login();
        clock.tick();

        expect(ga).to.have.been.calledOnce;
        expect(ga).to.have.been.calledWith('set', {userId: user._id});
      });
    });

    describe('track', function() {

      beforeEach(function() {
        sandbox.stub(amplitude, 'logEvent');
        sandbox.stub(window, 'ga');
      });

      context('successful tracking', function() {

        it('tracks a simple user action with Amplitude', function() {
          var properties = {'hitType':'event','eventCategory':'behavior','eventAction':'cron'};
          analytics.track(properties);
          clock.tick();

          expect(amplitude.logEvent).to.have.been.calledOnce;
          expect(amplitude.logEvent).to.have.been.calledWith('cron', properties);
        });

        it('tracks a simple user action with Google Analytics', function() {
          var properties = {'hitType':'event','eventCategory':'behavior','eventAction':'cron'};
          analytics.track(properties);
          clock.tick();

          expect(ga).to.have.been.calledOnce;
          expect(ga).to.have.been.calledWith('send', properties);
        });

        it('tracks a user action with additional properties in Amplitude', function() {
          var properties = {'hitType':'event','eventCategory':'behavior','eventAction':'cron','booleanProperty':true,'numericProperty':17,'stringProperty':'bagel'};
          analytics.track(properties);
          clock.tick();

          expect(amplitude.logEvent).to.have.been.calledOnce;
          expect(amplitude.logEvent).to.have.been.calledWith('cron', properties);
        });

        it('tracks a user action with additional properties in google analytics', function() {
          var properties = {'hitType':'event','eventCategory':'behavior','eventAction':'cron','booleanProperty':true,'numericProperty':17,'stringProperty':'bagel'};
          analytics.track(properties);
          clock.tick();

          expect(ga).to.have.been.calledOnce;
          expect(ga).to.have.been.calledWith('send', properties);
        });
      });

      context('unsuccessful tracking', function() {

        beforeEach(function() {
          sandbox.stub(console, 'log');
        });

        context('events without required properties', function() {
          beforeEach(function(){
            analytics.track('action');
            analytics.track({'hitType':'pageview','eventCategory':'green'});
            analytics.track({'hitType':'pageview','eventAction':'eat'});
            analytics.track({'eventCategory':'green','eventAction':'eat'});
            analytics.track({'hitType':'pageview'});
            analytics.track({'eventCategory':'green'});
            analytics.track({'eventAction':'eat'});
            clock.tick();
          });

          it('logs errors to console', function() {
            expect(console.log.callCount).to.eql(7);
          });

          it('does not call out to Amplitude', function() {
            expect(amplitude.logEvent).to.not.be.called;
          });

          it('does not call out to Google Analytics', function() {
            expect(ga).to.not.be.called;
          });
        });

        context('incorrect hit type', function() {
          beforeEach(function() {
            analytics.track({'hitType':'moogly','eventCategory':'green','eventAction':'eat'});
            clock.tick();
          });

          it('logs error to console', function () {
            expect(console.log).to.have.been.calledOnce;
          });

          it('does not call out to Amplitude', function() {
            expect(amplitude.logEvent).to.not.be.called;
          });

          it('does not call out to Google Analytics', function() {
            expect(ga).to.not.be.called;
          });
        });
      });
    });

    describe('updateUser', function() {

      beforeEach(function() {
        sandbox.stub(amplitude, 'setUserProperties');
        sandbox.stub(window, 'ga');
      });

      context('properties argument provided', function(){
        var properties = {'userBoolean': false, 'userNumber': -8, 'userString': 'Enlightened'};
        var expectedProperties = _.cloneDeep(properties);
        expectedProperties.UUID = 'unique-user-id';
        expectedProperties.Class = 'wizard';
        expectedProperties.Experience = 35;
        expectedProperties.Gold = 43;
        expectedProperties.Health = 48;
        expectedProperties.Level = 24;
        expectedProperties.Mana = 41;
        expectedProperties.tutorialComplete = false;
        expectedProperties["Number Of Tasks"] = {
          habits: 1,
          dailys: 1,
          todos: 1,
          rewards: 1
        };

        beforeEach(function() {
          user._id = 'unique-user-id';
          user.stats.class = 'wizard';
          user.stats.exp = 35.7;
          user.stats.gp = 43.2;
          user.stats.hp = 47.8;
          user.stats.lvl = 24;
          user.stats.mp = 41;
          user.flags.tour.intro = 3;
          user.habits = [{_id: 'habit'}];
          user.dailys = [{_id: 'daily'}];
          user.todos = [{_id: 'todo'}];
          user.rewards = [{_id: 'reward'}];

          analytics.updateUser(properties);
          clock.tick();
        });

        it('calls Amplitude with provided properties and select user info', function() {
          expect(amplitude.setUserProperties).to.have.been.calledOnce;
          expect(amplitude.setUserProperties).to.have.been.calledWith(expectedProperties);
        });

        it('calls Google Analytics with provided properties and select user info', function() {
          expect(ga).to.have.been.calledOnce;
          expect(ga).to.have.been.calledWith('set', expectedProperties);
        });
      });

      context('no properties argument provided', function() {
        var expectedProperties = {
          UUID: 'unique-user-id',
          Class: 'wizard',
          Experience: 35,
          Gold: 43,
          Health: 48,
          Level: 24,
          Mana: 41,
          contributorLevel: 1,
          subscription: 'unique-plan-id',
          tutorialComplete: true,
          "Number Of Tasks": {
            todos: 1,
            dailys: 1,
            habits: 1,
            rewards: 1
          }
        };

        beforeEach(function() {
          user._id = 'unique-user-id';
          user.stats.class = 'wizard';
          user.stats.exp = 35.7;
          user.stats.gp = 43.2;
          user.stats.hp = 47.8;
          user.stats.lvl = 24;
          user.stats.mp = 41;
          user.contributor.level = 1;
          user.purchased.plan.planId = 'unique-plan-id';
          user.flags.tour.intro = -2;
          user.habits = [{_id: 'habit'}];
          user.dailys = [{_id: 'daily'}];
          user.todos = [{_id: 'todo'}];
          user.rewards = [{_id: 'reward'}];

          analytics.updateUser();
          clock.tick();
        });

        it('calls Amplitude with select user info', function() {
          expect(amplitude.setUserProperties).to.have.been.calledOnce;
          expect(amplitude.setUserProperties).to.have.been.calledWith(expectedProperties);
        });

        it('calls Google Analytics with select user info', function() {
          expect(ga).to.have.been.calledOnce;
          expect(ga).to.have.been.calledWith('set', expectedProperties);
        });
      });
    });
  });
});
