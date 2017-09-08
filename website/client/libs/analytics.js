import isEqual from 'lodash/isEqual';
import keys from 'lodash/keys';
import pick from 'lodash/pick';
import includes from 'lodash/includes';
import getStore from 'client/store';

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

const store = getStore();

function _doesNotHaveRequiredFields (properties) {
  if (!isEqual(keys(pick(properties, REQUIRED_FIELDS)), REQUIRED_FIELDS)) {
    // @TODO: Log with Winston?
    // console.log('Analytics tracking calls must include the following properties: ' + JSON.stringify(REQUIRED_FIELDS));
    return true;
  }
}

function _doesNotHaveAllowedHitType (properties) {
  if (!includes(ALLOWED_HIT_TYPES, properties.hitType)) {
    // @TODO: Log with Winston?
    // console.log('Hit type of Analytics event must be one of the following: ' + JSON.stringify(ALLOWED_HIT_TYPES));
    return true;
  }
}

function _gatherUserStats (properties) {
  const user = store.state.user.data;
  const tasks = store.state.tasks.data;

  properties.UUID = user._id;

  properties.Class = user.stats.class;
  properties.Experience = Math.floor(user.stats.exp);
  properties.Gold = Math.floor(user.stats.gp);
  properties.Health = Math.ceil(user.stats.hp);
  properties.Level = user.stats.lvl;
  properties.Mana = Math.floor(user.stats.mp);

  properties.balance = user.balance;
  properties.balanceGemAmount = properties.balance * 4;

  properties.tutorialComplete = user.flags.tour.intro === -2;

  properties['Number Of Tasks'] = {
    habits: tasks.habits.length,
    dailys: tasks.dailys.length,
    todos: tasks.todos.length,
    rewards: tasks.rewards.length,
  };

  if (user.contributor.level) properties.contributorLevel = user.contributor.level;
  if (user.purchased.plan.planId) properties.subscription = user.purchased.plan.planId;
}

export function setUser () {
  const user = store.state.user.data;
  window.amplitude.setUserId(user._id);
  window.ga('set', {userId: user._id});
}

export function track (properties) {
  if (_doesNotHaveRequiredFields(properties)) return false;
  if (_doesNotHaveAllowedHitType(properties)) return false;

  window.amplitude.logEvent(properties.eventAction, properties);
  window.ga('send', properties);
}

export function updateUser (properties) {
  properties = properties || {};

  _gatherUserStats(properties);

  window.amplitude.setUserProperties(properties);
  window.ga('set', properties);
}