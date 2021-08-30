/* eslint-disable camelcase */
import nconf from 'nconf';
import Amplitude from 'amplitude';
import googleAnalytics from 'universal-analytics';
import useragent from 'useragent';
import {
  each,
  omit,
  toArray,
} from 'lodash';
import common from '../../common';
import logger from './logger';

const AMPLITUDE_TOKEN = nconf.get('AMPLITUDE_KEY');
const GA_TOKEN = nconf.get('GA_ID');

const LOG_AMPLITUDE_EVENTS = nconf.get('LOG_AMPLITUDE_EVENTS') === 'true';

const GA_POSSIBLE_LABELS = ['gaLabel', 'itemKey'];
const GA_POSSIBLE_VALUES = ['gaValue', 'gemCost', 'goldCost'];
const AMPLITUDE_PROPERTIES_TO_SCRUB = [
  'uuid', 'user', 'purchaseValue',
  'gaLabel', 'gaValue', 'headers', 'registeredThrough',
];

const PLATFORM_MAP = Object.freeze({
  'habitica-web': 'Web',
  'habitica-ios': 'iOS',
  'habitica-android': 'Android',
});

let amplitude;
if (AMPLITUDE_TOKEN) amplitude = new Amplitude(AMPLITUDE_TOKEN);

const ga = googleAnalytics(GA_TOKEN);

const Content = common.content;

function _lookUpItemName (itemKey) {
  if (!itemKey) return null;

  const gear = Content.gear.flat[itemKey];
  const egg = Content.eggs[itemKey];
  const food = Content.food[itemKey];
  const hatchingPotion = Content.hatchingPotions[itemKey];
  const quest = Content.quests[itemKey];
  const spell = Content.special[itemKey];

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
}

function _formatUserData (user) {
  const properties = {};

  if (user.stats) {
    properties.Class = user.stats.class;
    properties.Experience = Math.floor(user.stats.exp);
    properties.Gold = Math.floor(user.stats.gp);
    properties.Health = Math.ceil(user.stats.hp);
    properties.Level = user.stats.lvl;
    properties.Mana = Math.floor(user.stats.mp);
  }

  properties.balance = user.balance;
  properties.balanceGemAmount = properties.balance * 4;
  properties.tutorialComplete = user.flags && user.flags.tour && user.flags.tour.intro === -2;
  properties.verifiedUsername = user.flags && user.flags.verifiedUsername;
  if (properties.verifiedUsername && user.auth && user.auth.local) {
    properties.username = user.auth.local.lowerCaseUsername;
  }

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
  } else {
    properties.subscription = null;
  }

  if (user._ABtests) {
    properties.ABtests = toArray(user._ABtests);
  }

  if (user.loginIncentives) {
    properties.loginIncentives = user.loginIncentives;
  }

  return properties;
}

function _formatPlatformForAmplitude (platform) {
  if (!platform) {
    return 'Unknown';
  }

  if (platform in PLATFORM_MAP) {
    return PLATFORM_MAP[platform];
  }

  return '3rd Party';
}

function _formatUserAgentForAmplitude (platform, agentString) {
  if (!agentString) {
    return 'Unknown';
  }

  const agent = useragent.lookup(agentString).toJSON();
  const formattedAgent = {};
  if (platform === 'iOS' || platform === 'Android') {
    formattedAgent.name = agent.os.family;
    formattedAgent.version = `${agent.os.major}.${agent.os.minor}.${agent.os.patch}`;
    if (platform === 'Android' && formattedAgent.name === 'Other') {
      formattedAgent.name = 'Android';
    }
  } else {
    formattedAgent.name = agent.family;
    formattedAgent.version = agent.major;
  }

  return formattedAgent;
}

function _formatUUIDForAmplitude (uuid) {
  return uuid || 'no-user-id-was-provided';
}

function _formatDataForAmplitude (data) {
  const event_properties = omit(data, AMPLITUDE_PROPERTIES_TO_SCRUB);
  const platform = _formatPlatformForAmplitude(data.headers && data.headers['x-client']);
  const agent = _formatUserAgentForAmplitude(platform, data.headers && data.headers['user-agent']);
  const ampData = {
    user_id: _formatUUIDForAmplitude(data.uuid),
    platform,
    os_name: agent.name,
    os_version: agent.version,
    event_properties,
  };

  if (data.user) {
    ampData.user_properties = _formatUserData(data.user);
  }

  const itemName = _lookUpItemName(data.itemKey);

  if (itemName) {
    ampData.event_properties.itemName = itemName;
  }
  return ampData;
}

function _sendDataToAmplitude (eventType, data, loggerOnly) {
  const amplitudeData = _formatDataForAmplitude(data);

  amplitudeData.event_type = eventType;

  if (LOG_AMPLITUDE_EVENTS) {
    logger.info('Amplitude Event', amplitudeData);
  }

  if (loggerOnly) return Promise.resolve(null);

  return amplitude
    .track(amplitudeData)
    .catch(err => logger.error(err, 'Error while sending data to Amplitude.'));
}

function _generateLabelForGoogleAnalytics (data) {
  let label;

  each(GA_POSSIBLE_LABELS, key => {
    if (data[key]) {
      label = data[key];
      return false; // exit each early
    }

    return true;
  });

  return label;
}

function _generateValueForGoogleAnalytics (data) {
  let value;

  each(GA_POSSIBLE_VALUES, key => {
    if (data[key]) {
      value = data[key];
      return false; // exit each early
    }

    return true;
  });

  return value;
}

function _sendDataToGoogle (eventType, data) {
  const eventData = {
    ec: data.gaCategory || data.category || 'behavior',
    ea: eventType,
  };

  const label = _generateLabelForGoogleAnalytics(data);

  if (label) {
    eventData.el = label;
  }

  const value = _generateValueForGoogleAnalytics(data);

  if (value) {
    eventData.ev = value;
  }

  const promise = new Promise((resolve, reject) => {
    ga.event(eventData, err => {
      if (err) return reject(err);
      return resolve();
    });
  });

  return promise.catch(err => logger.error(err, 'Error while sending data to Google Analytics.'));
}

function _sendPurchaseDataToAmplitude (data) {
  const amplitudeData = _formatDataForAmplitude(data);

  // Stripe transactions come via webhook. We can log these as Web events
  if (data.paymentMethod === 'Stripe' && amplitudeData.platform === 'Unknown') {
    amplitudeData.platform = 'Web';
  }

  amplitudeData.event_type = 'purchase';
  amplitudeData.revenue = data.purchaseValue;
  amplitudeData.productId = data.itemPurchased;

  if (LOG_AMPLITUDE_EVENTS) {
    logger.info('Amplitude Purchase Event', amplitudeData);
  }

  return amplitude
    .track(amplitudeData)
    .catch(err => logger.error(err, 'Error while sending data to Amplitude.'));
}

function _sendPurchaseDataToGoogle (data) {
  const label = data.paymentMethod;
  const type = data.purchaseType;
  const price = data.purchaseValue;
  const qty = data.quantity;
  const { sku } = data;
  const itemKey = data.itemPurchased;
  let variation = type;

  if (data.gift) variation += ' - Gift';

  const eventData = {
    ec: 'commerce',
    ea: type,
    el: label,
    ev: price,
  };

  const eventPromise = new Promise((resolve, reject) => {
    ga.event(eventData, err => {
      if (err) return reject(err);
      return resolve();
    });
  });

  const transactionPromise = new Promise((resolve, reject) => {
    ga.transaction(data.uuid, price)
      .item(price, qty, sku, itemKey, variation)
      .send(err => {
        if (err) return reject(err);
        return resolve();
      });
  });

  return Promise
    .all([eventPromise, transactionPromise])
    .catch(err => logger.error(err, 'Error while sending data to Google Analytics.'));
}

function _setOnce (dataToSetOnce, uuid) {
  return amplitude
    .identify({
      user_id: _formatUUIDForAmplitude(uuid),
      user_properties: {
        $setOnce: dataToSetOnce,
      },
    })
    .catch(err => logger.error(err, 'Error while sending data to Amplitude.'));
}

// There's no error handling directly here because it's handled inside _sendDataTo{Amplitude|Google}
async function track (eventType, data, loggerOnly = false) {
  const promises = [
    _sendDataToAmplitude(eventType, data, loggerOnly),
    _sendDataToGoogle(eventType, data),
  ];
  if (data.user && data.user.registeredThrough) {
    promises.push(_setOnce({
      registeredPlatform: data.user.registeredThrough,
    }, data.uuid || data.user._id));
  }

  return Promise.all(promises);
}

// There's no error handling directly here because
// it's handled inside _sendPurchaseDataTo{Amplitude|Google}
async function trackPurchase (data) {
  return Promise.all([
    _sendPurchaseDataToAmplitude(data),
    _sendPurchaseDataToGoogle(data),
  ]);
}

// Stub for non-prod environments
const mockAnalyticsService = {
  track: () => { },
  trackPurchase: () => { },
};

// Return the production or mock service based on the current environment
function getServiceByEnvironment () {
  if (nconf.get('IS_PROD')) {
    return {
      track,
      trackPurchase,
    };
  }

  return mockAnalyticsService;
}

export {
  track,
  trackPurchase,
  mockAnalyticsService,
  getServiceByEnvironment as getAnalyticsServiceByEnvironment,
};
