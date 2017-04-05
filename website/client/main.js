// TODO verify if it's needed, added because Axios require Promise in the global scope
// and babel-runtime doesn't affect external libraries
require('babel-polyfill');

import Vue from 'vue';
import axios from 'axios';
import AppComponent from './app';
import router from './router';
import generateStore from './store';
import StoreModule from './libs/store';
import './filters/registerGlobals';
import i18n from './libs/i18n';

import BoostrapDropdown from 'bootstrap-vue/lib/components/dropdown';
import BoostrapDropdownItem from 'bootstrap-vue/lib/components/dropdown-item';

const IS_PRODUCTION = process.env.NODE_ENV === 'production'; // eslint-disable-line no-process-env

// Configure Vue global options, see https://vuejs.org/v2/api/#Global-Config

// Enable perf timeline measuring for Vue components in Chrome Dev Tools
// Note: this has been disabled because it caused some perf issues
// if rendering becomes too slow in dev mode, we should turn it off
// See https://github.com/vuejs/vue/issues/5174
Vue.config.performance = !IS_PRODUCTION;
// Disable annoying reminder abour production build in dev mode
Vue.config.productionTip = IS_PRODUCTION;

Vue.use(i18n);
Vue.use(StoreModule);

Vue.component('b-dropdown', BoostrapDropdown);
Vue.component('b-dropdown-item', BoostrapDropdownItem);

// TODO just until we have proper authentication
let authSettings = localStorage.getItem('habit-mobile-settings');

if (authSettings) {
  authSettings = JSON.parse(authSettings);
  axios.defaults.headers.common['x-api-user'] = authSettings.auth.apiId;
  axios.defaults.headers.common['x-api-key'] = authSettings.auth.apiToken;
}

export default new Vue({
  router,
  store: generateStore(),
  render: h => h(AppComponent),
  beforeCreate () {
    // Setup listener for title
    this.$store.watch(state => state.title, (title) => {
      document.title = title;
    });

    // Mount the app when user and tasks are loaded
    const userDataWatcher = this.$store.watch(state => [state.user.data, state.tasks.data], ([user, tasks]) => {
      if (user && user._id && Array.isArray(tasks)) {
        userDataWatcher(); // remove the watcher
        this.$mount('#app');
      }
    });

    // Load the user and the user tasks
    Promise.all([
      this.$store.dispatch('user:fetch'),
      this.$store.dispatch('tasks:fetchUserTasks'),
    ]).catch((err) => {
      console.error('Impossible to fetch user. Copy into localStorage a valid habit-mobile-settings object.', err); // eslint-disable-line no-console
    });
  },
  mounted () { // Remove the loading screen when the app is mounted
    let loadingScreen = document.getElementById('loading-screen');
    if (loadingScreen) document.body.removeChild(loadingScreen);
  },
});