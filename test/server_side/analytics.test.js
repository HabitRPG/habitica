var sinon = require('sinon');
var chai = require("chai")
chai.use(require("sinon-chai"))
var expect = chai.expect
var rewire = require('rewire');

describe('analytics', function() {
  var amplitudeMock = sinon.stub();
  var googleAnalyticsMock = sinon.stub();

  describe('init', function() {
    var analytics = rewire('../../website/src/analytics');

    afterEach(function(){
      amplitudeMock.reset();
      googleAnalyticsMock.reset();
    });

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

  describe('trackPurchase', function() {

    var purchaseData = {
      uuid: 'user-id',
      sku: 'paypal-checkout',
      paymentMethod: 'PayPal',
      itemPurchased: 'Gems',
      purchaseValue: 8,
      purchaseType: 'checkout',
      gift: false,
      quantity: 1
    }

    var analytics = rewire('../../website/src/analytics');
    var amplitudeTrack = sinon.stub();
    var googleEvent = sinon.stub().returns({
      send: function() { return true }
    });
    var googleItem = sinon.stub().returns({
      send: function() {}
    });
    var googleTransaction = sinon.stub().returns({
      item: googleItem
    });
    var initializedAnalytics;

    beforeEach(function() {
      analytics.__set__('Amplitude', amplitudeMock);
      initializedAnalytics = analytics({amplitudeToken: 'token', googleAnalytics: 'token'});
      analytics.__set__('amplitude.track', amplitudeTrack);
      analytics.__set__('ga.event', googleEvent);
      analytics.__set__('ga.transaction', googleTransaction);
    });

    afterEach(function(){
      amplitudeMock.reset();
      googleEvent.reset();
      googleTransaction.reset();
      googleItem.reset();
    });

    it('calls amplitude.track', function() {

      initializedAnalytics.trackPurchase(purchaseData);

      expect(amplitudeTrack).to.be.calledOnce;
      expect(amplitudeTrack).to.be.calledWith({
        event_type: 'purchase',
        user_id: 'user-id',
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

    it('calls ga.event', function() {

      initializedAnalytics.trackPurchase(purchaseData);

      expect(googleEvent).to.be.calledOnce;
      expect(googleEvent).to.be.calledWith(
        'commerce',
        'checkout',
        'PayPal',
        8
      );
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

    var purchaseDataWithGift = _.clone(purchaseData);
      purchaseDataWithGift.gift = true;

      initializedAnalytics.trackPurchase(purchaseDataWithGift);

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
