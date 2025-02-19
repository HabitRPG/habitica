import forEach from 'lodash/forEach';
import isEqual from 'lodash/isEqual';
import keys from 'lodash/keys';
import pick from 'lodash/pick';
import includes from 'lodash/includes';
import amplitude from 'amplitude-js';
import Vue from 'vue';
import Analytics from 'analytics';
import googleAnalytics from '@analytics/google-analytics';
import getStore from '@/store';

const IS_PRODUCTION = import.meta.env.NODE_ENV === 'production';
const AMPLITUDE_KEY = import.meta.env.AMPLITUDE_KEY;
const GA_ID = import.meta.env.GA_ID;
const DEBUG_ENABLED = import.meta.env.DEBUG_ENABLED === 'true';

const REQUIRED_FIELDS = ['hitType', 'eventCategory', 'eventAction'];
const ALLOWED_HIT_TYPES = [
  'pageview',
  'screenview',
  'event',
  'transaction',
  'item',
  'social',
  'exception',
  'timing',
];

const ga = Analytics({
  app: 'habitica',
  plugins: [
    googleAnalytics({
      measurementIds: [GA_ID],
      debug: !IS_PRODUCTION || DEBUG_ENABLED,
    }),
  ],
});

function _doesNotHaveRequiredFields (properties) {
  if (!isEqual(keys(pick(properties, REQUIRED_FIELDS)), REQUIRED_FIELDS)) {
    // @TODO: Log with Winston?
    // console.log('Analytics tracking calls must include
    // the following properties: ' + JSON.stringify(REQUIRED_FIELDS));
    return true;
  }

  return false;
}

function _doesNotHaveAllowedHitType (properties) {
  if (!includes(ALLOWED_HIT_TYPES, properties.hitType)) {
    // @TODO: Log with Winston?
    // console.log('Hit type of Analytics event must be one
    // of the following: ' + JSON.stringify(ALLOWED_HIT_TYPES));
    return true;
  }

  return false;
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
  ga.identify(user._id);
}

export function track (properties, options = {}) {
  // Use nextTick to avoid blocking the UI
  Vue.nextTick(() => {
    if (_doesNotHaveRequiredFields(properties)) return;
    if (_doesNotHaveAllowedHitType(properties)) return;

    const trackOnClient = options && options.trackOnClient === true;
    // Track events on the server by default
    if (trackOnClient === true) {
      amplitude.getInstance().logEvent(properties.eventAction, properties);
      ga.track(properties.eventAction, properties);
    } else {
      const store = getStore();
      store.dispatch('analytics:trackEvent', properties);
    }
  });
}

export function updateUser (properties = {}) {
  // Use nextTick to avoid blocking the UI
  Vue.nextTick(() => {
    _gatherUserStats(properties);

    forEach(properties, (value, key) => {
      const identify = new amplitude.Identify().set(key, value);
      amplitude.getInstance().identify(identify);
    });

    ga.identify(properties.UUID, properties);
  });
}

export function setup () {
  // Setup queues until the real scripts are loaded

  // Amplitude
  amplitude.getInstance().init(AMPLITUDE_KEY);
}
