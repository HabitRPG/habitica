import forEach from 'lodash/forEach';
import isEqual from 'lodash/isEqual';
import keys from 'lodash/keys';
import pick from 'lodash/pick';
import includes from 'lodash/includes';
import getStore from 'client/store';
import amplitude from 'amplitude-js';
import Vue from 'vue';

const IS_PRODUCTION = process.env.NODE_ENV === 'production'; // eslint-disable-line no-process-env
const AMPLITUDE_KEY = process.env.AMPLITUDE_KEY; // eslint-disable-line no-process-env
const GA_ID = process.env.GA_ID; // eslint-disable-line no-process-env

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
  const store = getStore();
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
  const store = getStore();
  const user = store.state.user.data;
  amplitude.getInstance().setUserId(user._id);
  window.ga('set', {userId: user._id});
}

export function track (properties) {
  // Use nextTick to avoid blocking the UI
  Vue.nextTick(() => {
    if (_doesNotHaveRequiredFields(properties)) return false;
    if (_doesNotHaveAllowedHitType(properties)) return false;

    amplitude.getInstance().logEvent(properties.eventAction, properties);
    window.ga('send', properties);
  });
}

export function updateUser (properties) {
  // Use nextTick to avoid blocking the UI
  Vue.nextTick(() => {
    properties = properties || {};

    _gatherUserStats(properties);

    forEach(properties, (value, key) => {
      const identify = new amplitude.Identify().set(key, value);
      amplitude.getInstance().identify(identify);
    });

    window.ga('set', properties);
  });
}

export function setup () {
  // Setup queues until the real scripts are loaded

  /* eslint-disable */

  // Amplitude
  amplitude.getInstance().init(AMPLITUDE_KEY);

  // Google Analytics (aka Universal Analytics)
  window['GoogleAnalyticsObject'] = 'ga';
  window['ga'] = window['ga'] || function() {
      (window['ga'].q = window['ga'].q || []).push(arguments)
    }, window['ga'].l = 1 * new Date();
  ga('create', GA_ID);
  /* eslint-enable */
}

export function load () {
  // Load real scripts
  if (!IS_PRODUCTION) return;

  let firstScript = document.getElementsByTagName('script')[0];
  // Google Analytics
  const gaScript = document.createElement('script');
  firstScript = document.getElementsByTagName('script')[0];
  gaScript.async = 1;
  gaScript.src = '//www.google-analytics.com/analytics.js';
  firstScript.parentNode.insertBefore(gaScript, firstScript);
}
