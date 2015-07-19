var _ = require('lodash');
require('coffee-script'); // remove this once we've fully converted over
var i18n = require('./i18n');
var Content = require('../../common/script/content');
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
  var eventData = {
    ec: data.category,
    ea: eventType
  }

  var label = _generateLabelForGoogleAnalytics(data);
  if(label) { eventData.el = label; }

  var value = _generateValueForGoogleAnalytics(data);
  if(value) { eventData.ev = value; }

  ga.event(eventData).send();
}

function _generateLabelForGoogleAnalytics(data) {
  var label;
  var POSSIBLE_LABELS = ['gaLabel', 'itemKey'];

  _(POSSIBLE_LABELS).each(function(key) {
    if(data[key]) {
      label = data[key];
      return false; // exit _.each early
    }
  });

  return label;
}

function _generateValueForGoogleAnalytics(data) {
  var value;
  var POSSIBLE_VALUES = ['gaValue', 'gemCost', 'goldCost'];

  _(POSSIBLE_VALUES).each(function(key) {
    if(data[key]) {
      value = data[key];
      return false; // exit _.each early
    }
  });

  return value;
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
  var PROPERTIES_TO_SCRUB = ['uuid', 'user', 'purchaseValue', 'gaLabel', 'gaValue'];
  var event_properties = _.omit(data, PROPERTIES_TO_SCRUB);

  var ampData = {
    user_id: data.uuid,
    platform: 'server',
    event_properties: event_properties
  }

  if(data.user) {
    ampData.user_properties = _formatUserData(data.user);
  }

  var itemName = _lookUpItemName(data.itemKey);
  if(itemName) {
    event_properties.itemName = itemName;
  }

  return ampData;
}

function _lookUpItemName(itemKey) {
  if (!itemKey) return;

  var gear = Content.gear.flat[itemKey];
  var egg = Content.eggs[itemKey];
  var food = Content.food[itemKey];
  var hatchingPotion = Content.hatchingPotions[itemKey];
  var quest = Content.quests[itemKey];
  var spell = Content.special[itemKey];

  var itemName;

  if (gear) {
    itemName = gear.text();
  } else if (egg) {
    itemName = egg.text() + ' Egg';
  } else if (food) {
    itemName = food.text();
  } else if (hatchingPotion) {
    itemName = hatchingPotion.text() + " Hatching Potion";
  } else if (quest) {
    itemName = quest.text();
  } else if (spell) {
    itemName = spell.text();
  }

  return itemName;
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

  var eventData = {
    ec: 'commerce',
    ea: type,
    el: label,
    ev: price
  };

  ga.event(eventData).send();

  ga.transaction(data.uuid, price)
    .item(price, qty, sku, itemKey, variation)
    .send();
}

module.exports = init;
