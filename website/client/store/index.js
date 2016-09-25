import Vue from 'vue';
import state from './state';
import * as actions from './actions';
import * as getters from './getters';

let _vm; // defined below

const store = {
  getters: {},
  state,
  actions,
  // Actions should be called using store.dispatch(ACTION, ...ARGS)
  dispatch (type, ...args) {
    let action = actions[type];

    if (!action) throw new Error(`Action "${type}" not found.`);
    return action(store, ...args);
  },
  $watch (getter, cb, options) {
    return _vm.$watch(() => getter(state), cb, options);
  },
};

// Setup getters
const _computed = {};

Object.keys(getters).forEach(key => {
  let getter = getters[key];

  _computed[key] = () => getter(state);

  Object.defineProperty(store.getters, key, {
    get: () => _vm[key],
  });
});

// Setup internal Vue instance to make state and getters reactive
_vm = new Vue({
  data: { state },
  computed: _computed,
});

export default store;

// Inject the store into all components
Vue.mixin({
  beforeCreate () {
    this.$store = store;
  },
});

