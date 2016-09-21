// TODO verify if it's needed, added because Vuex require Promise in the global scope
// and babel-runtime doesn't affect external libraries
require('babel-polyfill');

import Vue from 'vue';
import VuexRouterSync from 'vuex-router-sync';
import App from './components/app';
import router from './router';
import store from './vuex/store';

// Sync Vuex and Router
VuexRouterSync.sync(store, router);

new Vue({ // eslint-disable-line no-new
  router,
  store,
  el: '#app',
  render: h => h(App),
});