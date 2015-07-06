var _ = require('lodash');
var Amplitude = require('amplitude');
var googleAnalytics = require('universal-analytics');

var ga;
var amplitude;

var analytics = {
  trackPurchase: trackPurchase
}

function init(options) {
  if(!options) { throw 'No options provided' }

  amplitude = new Amplitude(options.amplitudeToken);
  ga = googleAnalytics(options.googleAnalytics);

  return analytics;
}

function trackPurchase(data) {
  _sendPurchaseDataToAmplitude(data);
  _sendPurchaseDataToGoogle(data);
}

function _sendPurchaseDataToAmplitude(data) {
  var amplitudeData = _formatDataForAmplitude(data);
  amplitudeData.event_type = 'purchase';
  amplitudeData.revenue = data.purchaseValue;

  amplitude.track(amplitudeData)
}

function _formatDataForAmplitude(data) {
  var PROPERTIES_TO_SCRUB = ['uuid', 'user', 'purchaseValue'];
  var event_properties = _.omit(data, PROPERTIES_TO_SCRUB);

  var ampData = {
    user_id: data.uuid,
    event_properties: event_properties
  }

  if(data.user) {
    ampData.user_properties = _formatUserData(data.user);
  }

  return ampData;
}

function _formatUserData(user) {
  var data = {};

  return data;
}

function _sendPurchaseDataToGoogle(data) {
  var label = data.paymentMethod;
  var type = data.purchaseType;
  var price = data.purchaseValue;
  var qty = data.quantity;
  var sku = data.sku;
  var itemName = data.itemPurchased;
  var variation = type;
  if(data.gift) variation += ' - Gift';

  ga.event('commerce', type, label, price)
    .send();

  ga.transaction(data.uuid, price)
    .item(price, qty, sku, itemName, variation)
    .send();
}

module.exports = init;
