import isEqual from 'lodash/isEqual';
import keys from 'lodash/keys';
import pick from 'lodash/pick';
import includes from 'lodash/includes';

let REQUIRED_FIELDS = ['hitType', 'eventCategory', 'eventAction'];
let ALLOWED_HIT_TYPES = [
  'pageview',
  'screenview',
  'event',
  'transaction',
  'item',
  'social',
  'exception',
  'timing',
];

// @TODO: What is was the timeout for?

function _doesNotHaveRequiredFields (properties) {
  if (!isEqual(keys(pick(properties, REQUIRED_FIELDS)), REQUIRED_FIELDS)) {
    // @TODO: Log with Winston?
    //  console.log('Analytics tracking calls must include the following properties: ' + JSON.stringify(REQUIRED_FIELDS));
    return true;
  }
}

function _doesNotHaveAllowedHitType (properties) {
  if (!includes(ALLOWED_HIT_TYPES, properties.hitType)) {
    // @TODO: Log with Winston?
    //  console.log('Hit type of Analytics event must be one of the following: ' + JSON.stringify(ALLOWED_HIT_TYPES));
    return true;
  }
}

function _gatherUserStats (user, properties) {
  if (user._id) properties.UUID = user._id;
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
  if (user.habits && user.dailys && user.todos && user.rewards) {
    properties['Number Of Tasks'] = {
      habits: user.habits.length,
      dailys: user.dailys.length,
      todos: user.todos.length,
      rewards: user.rewards.length,
    };
  }
  if (user.contributor && user.contributor.level) properties.contributorLevel = user.contributor.level;
  if (user.purchased && user.purchased.plan.planId) properties.subscription = user.purchased.plan.planId;
}

export function register (user) {
  window.amplitude.setUserId(user._id);
  window.ga('set', {userId: user._id});
}

export function login (user) {
  window.amplitude.setUserId(user._id);
  window.ga('set', {userId: user._id});
}

export function track (properties) {
  if (_doesNotHaveRequiredFields(properties)) return false;
  if (_doesNotHaveAllowedHitType(properties)) return false;

  window.amplitude.logEvent(properties.eventAction, properties);
  window.ga('send', properties);
}

export function updateUser (properties, user) {
  properties = properties || {};

  _gatherUserStats(user, properties);

  window.amplitude.setUserProperties(properties);
  window.ga('set', properties);
}