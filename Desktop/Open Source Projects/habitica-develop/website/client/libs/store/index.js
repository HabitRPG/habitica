import Vue from 'vue';

// Central application store for Habitica
// Heavily inspired to Vuex (https://github.com/vuejs/vuex) with a very
// similar internal implementation (thanks!), main difference is the absence of mutations.

export default class Store {
  constructor ({state, getters, actions}) {
    // Store actions
    this._actions = actions;

    // Store getters (computed properties), implemented as computed properties in the internal Vue VM
    this.getters = {};

    // Setup getters
    const _computed = {};

    Object.keys(getters).forEach(key => {
      let getter = getters[key];

      // Each getter is compiled to a computed property on the internal VM
      _computed[key] = () => getter(this);

      Object.defineProperty(this.getters, key, {
        get: () => this._vm[key],
      });
    });

    // Setup internal Vue instance to make state and getters reactive
    this._vm = new Vue({
      data: { state },
      computed: _computed,
    });
  }

  // Return the store's state
  get state () {
    return this._vm.$data.state;
  }

  // Actions should be called using store.dispatch(ACTION_NAME, ...ARGS)
  // They get passed the store instance and any additional argument passed to dispatch()
  dispatch (type, ...args) {
    let action = this._actions[type];

    if (!action) throw new Error(`Action "${type}" not found.`);
    return action(this, ...args);
  }

  // Watch data on the store's state
  // Internally it uses vm.$watch and accept the same argument except
  // for the first one that must be a getter function to which the state is passed
  // For documentation see https://vuejs.org/api/#vm-watch
  watch (getter, cb, options) {
    if (typeof getter !== 'function') {
      throw new Error('The first argument of store.watch must be a function.');
    }

    return this._vm.$watch(() => getter(this.state), cb, options);
  }

  // Expose the store as this.$store in components
  // Is automatically called when Vue.plugin(Store) is used
  static install (_Vue) {
    _Vue.mixin({
      beforeCreate () {
        const options = this.$options;
        // store injection
        if (options.store) {
          this.$store = options.store;
        } else if (options.parent && options.parent.$store) {
          this.$store = options.parent.$store;
        }
      },
    });
  }
}

export {
  mapState,
  mapGetters,
  mapActions,
} from './helpers/public';
