import Vue from 'vue';
import state from './state';
import * as actions from './actions';
import * as getters from './getters';

// Central application store for Habitica
// Heavily inspired to Vuex (https://github.com/vuejs/vuex) with a very
// similar internal implementation (thanks!), main difference is the absence of mutations.

// Create a Vue instance (defined below) detatched from any DOM element to handle app data
let _vm;

// The actual store interface
const store = {
  // App wide computed properties, calculated as computed properties in the internal VM
  getters: {},
  // Return the store's state
  get state () {
    return _vm.$data.state;
  },
  // Actions should be called using store.dispatch(ACTION_NAME, ...ARGS)
  // They get passed the store instance and any additional argument passed to dispatch()
  dispatch (type, ...args) {
    let action = actions[type];

    if (!action) throw new Error(`Action "${type}" not found.`);
    return action(store, ...args);
  },
  // Watch data on the store's state
  // Internally it uses vm.$watch and accept the same argument except
  // for the first one that must be a getter function to which the state is passed
  // For documentation see https://vuejs.org/api/#vm-watch
  watch (getter, cb, options) {
    if (typeof getter !== 'function') {
      throw new Error('The first argument of store.watch must be a function.');
    }

    return _vm.$watch(() => getter(state), cb, options);
  },
};

// Setup getters
const _computed = {};

Object.keys(getters).forEach(key => {
  let getter = getters[key];

  // Each getter is compiled to a computed property on the internal VM
  _computed[key] = () => getter(store);

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

export {
  mapState,
  mapGetters,
  mapActions,
} from './helpers';

// Inject the store into all components as this.$store
Vue.mixin({
  beforeCreate () {
    this.$store = store;
  },
});

