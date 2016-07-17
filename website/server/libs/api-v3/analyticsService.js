/* eslint-disable camelcase */
import nconf from 'nconf';
import Amplitude from 'amplitude';
import Bluebird from 'bluebird';
import googleAnalytics from 'universal-analytics';
import {
  each,
  omit,
} from 'lodash';
import { content as Content } from '../../../../common';

const AMPLIUDE_TOKEN = nconf.get('AMPLITUDE_KEY');
const GA_TOKEN = nconf.get('GA_ID');
const GA_POSSIBLE_LABELS = ['gaLabel', 'itemKey'];
const GA_POSSIBLE_VALUES = ['gaValue', 'gemCost', 'goldCost'];
const AMPLITUDE_PROPERTIES_TO_SCRUB = ['uuid', 'user', 'purchaseValue', 'gaLabel', 'gaValue'];

let amplitude = new Amplitude(AMPLIUDE_TOKEN);
let ga = googleAnalytics(GA_TOKEN);

let _lookUpItemName = (itemKey) => {
  if (!itemKey) return;

  let gear = Content.gear.flat[itemKey];
  let egg = Content.eggs[itemKey];
  let food = Content.food[itemKey];
  let hatchingPotion = Content.hatchingPotions[itemKey];
  let quest = Content.quests[itemKey];
  let spell = Content.special[itemKey];

  let itemName;

  if (gear) {
    itemName = gear.text();
  } else if (egg) {
    itemName = `${egg.text()} Egg`;
  } else if (food) {
    itemName = food.text();
  } else if (hatchingPotion) {
    itemName = `${hatchingPotion.text()} Hatching Potion`;
  } else if (quest) {
    itemName = quest.text();
  } else if (spell) {
    itemName = spell.text();
  }

  return itemName;
};

let _formatUserData = (user) => {
  let properties = {};

  if (user.stats) {
    properties.Class = user.stats.class;
    properties.Experience = Math.floor(user.stats.exp);
    properties.Gold = Math.floor(user.stats.gp);
    properties.Health = Math.ceil(user.stats.hp);
    properties.Level = user.stats.lvl;
    properties.Mana = Math.floor(user.stats.mp);
  }

  properties.tutorialComplete = user.flags && user.flags.tour && user.flags.tour.intro === -2;

  if (user.habits && user.dailys && user.todos && user.rewards) {
    properties['Number Of Tasks'] = {
      habits: user.habits.length,
      dailys: user.dailys.length,
      todos: user.todos.length,
      rewards: user.rewards.length,
    };
  }

  if (user.contributor && user.contributor.level) {
    properties.contributorLevel = user.contributor.level;
  }

  if (user.purchased && user.purchased.plan.planId) {
    properties.subscription = user.purchased.plan.planId;
  }

  return properties;
};


let _formatDataForAmplitude = (data) => {
  let event_properties = omit(data, AMPLITUDE_PROPERTIES_TO_SCRUB);

  let ampData = {
    user_id: data.uuid || 'no-user-id-was-provided',
    platform: 'server',
    event_properties,
  };

  if (data.user) {
    ampData.user_properties = _formatUserData(data.user);
  }

  let itemName = _lookUpItemName(data.itemKey);

  if (itemName) {
    event_properties.itemName = itemName;
  }

  return ampData;
};

let _sendDataToAmplitude = (eventType, data) => {
  let amplitudeData = _formatDataForAmplitude(data);

  amplitudeData.event_type = eventType;

  return new Bluebird((resolve, reject) => {
    amplitude.track(amplitudeData)
      .then(resolve)
      .catch(reject);
  });
};

let _generateLabelForGoogleAnalytics = (data) => {
  let label;

  each(GA_POSSIBLE_LABELS, (key) => {
    if (data[key]) {
      label = data[key];
      return false; // exit each early
    }
  });

  return label;
};

let _generateValueForGoogleAnalytics = (data) => {
  let value;

  each(GA_POSSIBLE_VALUES, (key) => {
    if (data[key]) {
      value = data[key];
      return false; // exit each early
    }
  });

  return value;
};

let _sendDataToGoogle = (eventType, data) => {
  let eventData = {
    ec: data.gaCategory || data.category || 'behavior',
    ea: eventType,
  };

  let label = _generateLabelForGoogleAnalytics(data);

  if (label) {
    eventData.el = label;
  }

  let value = _generateValueForGoogleAnalytics(data);

  if (value) {
    eventData.ev = value;
  }

  return new Bluebird((resolve, reject) => {
    ga.event(eventData, (err) => {
      if (err) return reject(err);
      resolve();
    });
  });
};

let _sendPurchaseDataToAmplitude = (data) => {
  let amplitudeData = _formatDataForAmplitude(data);

  amplitudeData.event_type = 'purchase';
  amplitudeData.revenue = data.purchaseValue;

  return new Bluebird((resolve, reject) => {
    amplitude.track(amplitudeData)
      .then(resolve)
      .catch(reject);
  });
};

let _sendPurchaseDataToGoogle = (data) => {
  let label = data.paymentMethod;
  let type = data.purchaseType;
  let price = data.purchaseValue;
  let qty = data.quantity;
  let sku = data.sku;
  let itemKey = data.itemPurchased;
  let variation = type;

  if (data.gift) variation += ' - Gift';

  let eventData = {
    ec: 'commerce',
    ea: type,
    el: label,
    ev: price,
  };

  return new Bluebird((resolve) => {
    ga.event(eventData).send();

    ga.transaction(data.uuid, price)
      .item(price, qty, sku, itemKey, variation)
      .send();

    resolve();
  });
};

function track (eventType, data) {
  return Bluebird.all([
    _sendDataToAmplitude(eventType, data),
    _sendDataToGoogle(eventType, data),
  ]);
}

function trackPurchase (data) {
  return Bluebird.all([
    _sendPurchaseDataToAmplitude(data),
    _sendPurchaseDataToGoogle(data),
  ]);
}

// Stub for non-prod environments
let mockAnalyticsService = {
  track: () => { },
  trackPurchase: () => { },
};

module.exports = {
  track,
  trackPurchase,
  mockAnalyticsService,
};
