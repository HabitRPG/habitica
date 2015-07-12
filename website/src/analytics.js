var _ = require('lodash');
var Amplitude = require('amplitude');
var googleAnalytics = require('universal-analytics');

var ga;
var amplitude;

var analytics = {
  trackPurchase: trackPurchase,
  track: track
}

function init(options) {
  if(!options) { throw 'No options provided' }

  amplitude = new Amplitude(options.amplitudeToken);
  ga = googleAnalytics(options.googleAnalytics);

  return analytics;
}

function track(eventType, data) {
  _sendDataToAmplitude(eventType, data);
  _sendDataToGoogle(eventType, data);
}

function _sendDataToAmplitude(eventType, data) {
  var amplitudeData = _formatDataForAmplitude(data);
  amplitudeData.event_type = eventType;
  amplitude.track(amplitudeData);
}

function _sendDataToGoogle(eventType, data) {
  var category = data.category;
  var label = _generateLabelForGoogleAnalytics(data);

  ga.event(category, eventType, label).send();
}

function _generateLabelForGoogleAnalytics(data) {
  var label = 'Label Not Specified';
  var POSSIBLE_LABELS = ['gaLabel', 'itemKey', 'gemCost', 'goldCost'];

  _(POSSIBLE_LABELS).each(function(key) {
    if(data[key]) {
      label = data[key];
      return false; // exit _.each early
    }
  });

  return label;
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
  var PROPERTIES_TO_SCRUB = ['uuid', 'user', 'purchaseValue', 'gaLabel'];
  var event_properties = _.omit(data, PROPERTIES_TO_SCRUB);

  var ampData = {
    user_id: data.uuid,
    platform: 'server',
    event_properties: event_properties
  }

  if(data.user) {
    ampData.user_properties = _formatUserData(data.user);
  }

  return ampData;
}

function _formatUserData(user) {
  var properties = {};

  if (user.stats) {
    properties.Class = user.stats.class;
    properties.Experience = Math.floor(user.stats.exp);
    properties.Gold = Math.floor(user.stats.gp);
    properties.Health = Math.ceil(user.stats.hp);
    properties.Level = user.stats.lvl;
    properties.Mana = Math.floor(user.stats.mp);
  }

  if (user.contributor && user.contributor.level) {
    properties.contributorLevel = user.contributor.level;
  }

  if (user.purchased && user.purchased.plan.planId) {
    properties.subscription = user.purchased.plan.planId;
  }

  return properties;
}

function _sendPurchaseDataToGoogle(data) {
  var label = data.paymentMethod;
  var type = data.purchaseType;
  var price = data.purchaseValue;
  var qty = data.quantity;
  var sku = data.sku;
  var itemKey = data.itemPurchased;
  var variation = type;
  if(data.gift) variation += ' - Gift';

  ga.event('commerce', type, label, price)
    .send();

  ga.transaction(data.uuid, price)
    .item(price, qty, sku, itemKey, variation)
    .send();
}

module.exports = init;
