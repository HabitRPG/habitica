/**
 * Created by Sabe on 6/11/2015.
 */
'use strict';

describe('Analytics Service', function () {
  var analytics;

  beforeEach(function() {
    inject(function(Analytics) {
      analytics = Analytics;
    });
  });

  context('error handling', function() {

    before(function() {
      sinon.stub(console, 'log');
    });

    afterEach(function() {
      console.log.reset();
    });

    after(function() {
      console.log.restore();
    });

    it('does not accept tracking events without required properties', function() {
      analytics.track('action');
      analytics.track({'hitType':'pageview','eventCategory':'green'});
      analytics.track({'hitType':'pageview','eventAction':'eat'});
      analytics.track({'eventCategory':'green','eventAction':'eat'});
      analytics.track({'hitType':'pageview'});
      analytics.track({'eventCategory':'green'});
      analytics.track({'eventAction':'eat'});
      expect(console.log.callCount).to.eql(7);
    });

    it('does not accept tracking events with incorrect hit type', function () {
      analytics.track({'hitType':'moogly','eventCategory':'green','eventAction':'eat'});
      expect(console.log).to.have.been.calledOnce;
    });
  });

  context('Amplitude', function() {

    before(function() {
      sinon.stub(amplitude, 'setUserId');
      sinon.stub(amplitude, 'logEvent');
      sinon.stub(amplitude, 'setUserProperties');
    });

    afterEach(function() {
      amplitude.setUserId.reset();
      amplitude.logEvent.reset();
      amplitude.setUserProperties.reset();
    });

    after(function() {
      amplitude.setUserId.restore();
      amplitude.logEvent.restore();
      amplitude.setUserProperties.restore();
    });

    it('sets up tracking when user registers', function() {
      analytics.register();
      expect(amplitude.setUserId).to.have.been.calledOnce;
    });

    it('sets up tracking when user logs in', function() {
      analytics.login();
      expect(amplitude.setUserId).to.have.been.calledOnce;
    });

    it('tracks a simple user action', function() {
      analytics.track({'hitType':'event','eventCategory':'behavior','eventAction':'cron'});
      expect(amplitude.logEvent).to.have.been.calledOnce;
      expect(amplitude.logEvent).to.have.been.calledWith('cron',{'hitType':'event','eventCategory':'behavior','eventAction':'cron'});
    });

    it('tracks a user action with additional properties', function() {
      analytics.track({'hitType':'event','eventCategory':'behavior','eventAction':'cron','booleanProperty':true,'numericProperty':17,'stringProperty':'bagel'});
      expect(amplitude.logEvent).to.have.been.calledOnce;
      expect(amplitude.logEvent).to.have.been.calledWith('cron',{'hitType':'event','eventCategory':'behavior','eventAction':'cron','booleanProperty':true,'numericProperty':17,'stringProperty':'bagel'});
    });

    it('updates user-level properties', function() {
      analytics.updateUser({'userBoolean': false, 'userNumber': -8, 'userString': 'Enlightened'});
      expect(amplitude.setUserProperties).to.have.been.calledOnce;
      expect(amplitude.setUserProperties).to.have.been.calledWith({'userBoolean': false, 'userNumber': -8, 'userString': 'Enlightened'});
    });
  });

  context('Google Analytics', function() {

    before(function() {
      sinon.stub(ga);
    });

    afterEach(function() {
      ga.reset();
    });

    after(function() {
      ga.restore();
    });

    it('sets up tracking when user registers', function() {
      analytics.register();
      expect(ga).to.have.been.calledOnce;
      expect(ga).to.have.been.calledWith('set');
    });

    it('sets up tracking when user logs in', function() {
      analytics.login();
      expect(ga).to.have.been.calledOnce;
      expect(ga).to.have.been.calledWith('set');
    });

    it('tracks a simple user action', function() {
      analytics.track({'hitType':'event','eventCategory':'behavior','eventAction':'cron'});
      expect(ga).to.have.been.calledOnce;
      expect(ga).to.have.been.calledWith('send',{'hitType':'event','eventCategory':'behavior','eventAction':'cron'});
    });

    it('tracks a user action with additional properties', function() {
      analytics.track({'hitType':'event','eventCategory':'behavior','eventAction':'cron','booleanProperty':true,'numericProperty':17,'stringProperty':'bagel'});
      expect(ga).to.have.been.calledOnce;
      expect(ga).to.have.been.calledWith('send',{'hitType':'event','eventCategory':'behavior','eventAction':'cron','booleanProperty':true,'numericProperty':17,'stringProperty':'bagel'});
    });

    it('updates user-level properties', function() {
      analytics.updateUser({'userBoolean': false, 'userNumber': -8, 'userString': 'Enlightened'});
      expect(ga).to.have.been.calledOnce;
      expect(ga).to.have.been.calledWith('set',{'userBoolean': false, 'userNumber': -8, 'userString': 'Enlightened'});
    });
  });

  context.skip('Mixpanel', function() { // Mixpanel not currently in use

    before(function() {
      sinon.stub(mixpanel, 'alias');
      sinon.stub(mixpanel, 'identify');
      sinon.stub(mixpanel, 'track');
      sinon.stub(mixpanel, 'register');
    });

    afterEach(function() {
      mixpanel.alias.reset();
      mixpanel.identify.reset();
      mixpanel.track.reset();
      mixpanel.register.reset();
    });

    after(function() {
      mixpanel.alias.restore();
      mixpanel.identify.restore();
      mixpanel.track.restore();
      mixpanel.register.restore();
    });

    it('sets up tracking when user registers', function() {
      analytics.register();
      expect(mixpanel.alias).to.have.been.calledOnce;
    });

    it('sets up tracking when user logs in', function() {
      analytics.login();
      expect(mixpanel.identify).to.have.been.calledOnce;
    });

    it('tracks a simple user action', function() {
      analytics.track({'hitType':'event','eventCategory':'behavior','eventAction':'cron'});
      expect(mixpanel.track).to.have.been.calledOnce;
      expect(mixpanel.track).to.have.been.calledWith('cron',{'hitType':'event','eventCategory':'behavior','eventAction':'cron'});
    });

    it('tracks a user action with additional properties', function() {
      analytics.track({'hitType':'event','eventCategory':'behavior','eventAction':'cron','booleanProperty':true,'numericProperty':17,'stringProperty':'bagel'});
      expect(mixpanel.track).to.have.been.calledOnce;
      expect(mixpanel.track).to.have.been.calledWith('cron',{'hitType':'event','eventCategory':'behavior','eventAction':'cron','booleanProperty':true,'numericProperty':17,'stringProperty':'bagel'});
    });

    it('updates user-level properties', function() {
      analytics.updateUser({'userBoolean': false, 'userNumber': -8, 'userString': 'Enlightened'});
      expect(mixpanel.register).to.have.been.calledOnce;
      expect(mixpanel.register).to.have.been.calledWith({'userBoolean': false, 'userNumber': -8, 'userString': 'Enlightened'});
    });
  });
});
