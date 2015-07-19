var sinon = require('sinon');
var chai = require("chai")
chai.use(require("sinon-chai"))
var expect = chai.expect
var rewire = require('rewire');

describe('analytics', function() {
  // Mocks
  var amplitudeMock = sinon.stub();
  var googleAnalyticsMock = sinon.stub();
  var amplitudeTrack = sinon.stub();
  var googleEvent = sinon.stub().returns({
    send: function() { }
  });
  var googleItem = sinon.stub().returns({
    send: function() { }
  });
  var googleTransaction = sinon.stub().returns({
    item: googleItem
  });

  afterEach(function(){
    amplitudeMock.reset();
    amplitudeTrack.reset();
    googleEvent.reset();
    googleTransaction.reset();
    googleItem.reset();
  });

  describe('init', function() {
    var analytics = rewire('../../website/src/analytics');

    it('throws an error if no options are passed in', function() {
      expect(analytics).to.throw('No options provided');
    });

    it('registers amplitude with token', function() {
      analytics.__set__('Amplitude', amplitudeMock);
      var options = {
        amplitudeToken: 'token'
      };
      analytics(options);

      expect(amplitudeMock).to.be.calledOnce;
      expect(amplitudeMock).to.be.calledWith('token');
    });

    it('registers google analytics with token', function() {
      analytics.__set__('googleAnalytics', googleAnalyticsMock);
      var options = {
        googleAnalytics: 'token'
      };
      analytics(options);

      expect(googleAnalyticsMock).to.be.calledOnce;
      expect(googleAnalyticsMock).to.be.calledWith('token');
    });
  });

  describe('track', function() {

    var analyticsData, event_type;
    var analytics = rewire('../../website/src/analytics');
    var initializedAnalytics;

    beforeEach(function() {
      analytics.__set__('Amplitude', amplitudeMock);
      initializedAnalytics = analytics({amplitudeToken: 'token'});
      analytics.__set__('amplitude.track', amplitudeTrack);
      analytics.__set__('ga.event', googleEvent);

      event_type = 'Cron';
      analyticsData = {
        category: 'behavior',
        uuid: 'unique-user-id',
        resting: true,
        cronCount: 5
      }
    });

    context('Amplitude', function() {
      it('tracks event in amplitude', function() {

        initializedAnalytics.track(event_type, analyticsData);

        expect(amplitudeTrack).to.be.calledOnce;
        expect(amplitudeTrack).to.be.calledWith({
          event_type: 'Cron',
          user_id: 'unique-user-id',
          platform: 'server',
          event_properties: {
            category: 'behavior',
            resting: true,
            cronCount: 5
          }
        });
      });

      it('sends user data if provided', function() {
        var stats = { class: 'wizard', exp: 5, gp: 23, hp: 10, lvl: 4, mp: 30 };
        var user = {
          stats: stats,
          contributor: { level: 1 },
          purchased: { plan: { planId: 'foo-plan' } }
        };

        analyticsData.user = user;

        initializedAnalytics.track(event_type, analyticsData);

        expect(amplitudeTrack).to.be.calledOnce;
        expect(amplitudeTrack).to.be.calledWith({
          event_type: 'Cron',
          user_id: 'unique-user-id',
          platform: 'server',
          event_properties: {
            category: 'behavior',
            resting: true,
            cronCount: 5
          },
          user_properties: {
            Class: 'wizard',
            Experience: 5,
            Gold: 23,
            Health: 10,
            Level: 4,
            Mana: 30,
            contributorLevel: 1,
            subscription: 'foo-plan'
          }
        });
      });
    });

    context('Google Analytics', function() {
      it('tracks event in google analytics', function() {
        initializedAnalytics.track(event_type, analyticsData);

        expect(googleEvent).to.be.calledOnce;
        expect(googleEvent).to.be.calledWith({
          ec: 'behavior',
          ea: 'Cron'
        });
      });

      it('if itemKey property is provided, use as label', function() {
        analyticsData.itemKey = 'some item';

        initializedAnalytics.track(event_type, analyticsData);

        expect(googleEvent).to.be.calledOnce;
        expect(googleEvent).to.be.calledWith({
          ec: 'behavior',
          ea: 'Cron',
          el: 'some item'
        });
      });

      it('if gaLabel property is provided, use as label (overrides itemKey)', function() {
        analyticsData.value = 'some value';
        analyticsData.itemKey = 'some item';
        analyticsData.gaLabel = 'some label';

        initializedAnalytics.track(event_type, analyticsData);

        expect(googleEvent).to.be.calledOnce;
        expect(googleEvent).to.be.calledWith({
          ec: 'behavior',
          ea: 'Cron',
          el: 'some label'
        });
      });
    });
  });

  describe('trackPurchase', function() {

    var purchaseData;

    var analytics = rewire('../../website/src/analytics');
    var initializedAnalytics;

    beforeEach(function() {
      analytics.__set__('Amplitude', amplitudeMock);
      initializedAnalytics = analytics({amplitudeToken: 'token', googleAnalytics: 'token'});
      analytics.__set__('amplitude.track', amplitudeTrack);
      analytics.__set__('ga.event', googleEvent);
      analytics.__set__('ga.transaction', googleTransaction);

     purchaseData  = {
        uuid: 'user-id',
        sku: 'paypal-checkout',
        paymentMethod: 'PayPal',
        itemPurchased: 'Gems',
        purchaseValue: 8,
        purchaseType: 'checkout',
        gift: false,
        quantity: 1
      }

    });

    context('Amplitude', function() {

      it('calls amplitude.track', function() {
        initializedAnalytics.trackPurchase(purchaseData);

        expect(amplitudeTrack).to.be.calledOnce;
        expect(amplitudeTrack).to.be.calledWith({
          event_type: 'purchase',
          user_id: 'user-id',
          platform: 'server',
          event_properties: {
            paymentMethod: 'PayPal',
            sku: 'paypal-checkout',
            gift: false,
            itemPurchased: 'Gems',
            purchaseType: 'checkout',
            quantity: 1
          },
          revenue: 8
        });
      });
    });

    context('Google Analytics', function() {

      it('calls ga.event', function() {
        initializedAnalytics.trackPurchase(purchaseData);

        expect(googleEvent).to.be.calledOnce;
        expect(googleEvent).to.be.calledWith({
          ec: 'commerce',
          ea: 'checkout',
          el: 'PayPal',
          ev: 8
        });
      });

      it('calls ga.transaction', function() {
        initializedAnalytics.trackPurchase(purchaseData);

        expect(googleTransaction).to.be.calledOnce;
        expect(googleTransaction).to.be.calledWith(
          'user-id',
          8
        );
        expect(googleItem).to.be.calledOnce;
        expect(googleItem).to.be.calledWith(
          8,
          1,
          'paypal-checkout',
          'Gems',
          'checkout'
        );
      });

      it('appends gift to variation of ga.transaction.item if gift is true', function() {

        purchaseData.gift = true;
        initializedAnalytics.trackPurchase(purchaseData);

        expect(googleItem).to.be.calledOnce;
        expect(googleItem).to.be.calledWith(
          8,
          1,
          'paypal-checkout',
          'Gems',
          'checkout - Gift'
        );
      });
    });
  });
});
