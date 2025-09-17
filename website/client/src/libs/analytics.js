import isEqual from 'lodash/isEqual';
import keys from 'lodash/keys';
import pick from 'lodash/pick';
import Vue from 'vue';
import getStore from '@/store';

const REQUIRED_FIELDS = ['eventCategory', 'eventAction'];

function _getConsentedUser () {
  const store = getStore();
  const user = store.state.user.data;
  if (!user?.preferences?.analyticsConsent) {
    return false;
  }
  return user;
}

function _doesNotHaveRequiredFields (properties) {
  if (!isEqual(keys(pick(properties, REQUIRED_FIELDS)), REQUIRED_FIELDS)) {
    // @TODO: Log with Winston?
    // console.log('Analytics tracking calls must include
    // the following properties: ' + JSON.stringify(REQUIRED_FIELDS));
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

export function track (properties) {
  const user = _getConsentedUser();
  if (!user) return;
  // Use nextTick to avoid blocking the UI
  Vue.nextTick(() => {
    if (_doesNotHaveRequiredFields(properties)) return;
    const store = getStore();
    store.dispatch('analytics:trackEvent', properties);
  });
}

export function updateUser (properties = {}) {
  const user = _getConsentedUser();
  if (!user) return;
  // Use nextTick to avoid blocking the UI
  Vue.nextTick(() => {
    _gatherUserStats(properties);
    const store = getStore();
    store.dispatch('analytics:updateUserProperties', properties);
  });
}
