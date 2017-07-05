// TODO verify if it's needed, added because Axios require Promise in the global scope
// and babel-runtime doesn't affect external libraries
require('babel-polyfill');

import Vue from 'vue';
import AppComponent from './app';
import router from './router';
import getStore from './store';
import StoreModule from './libs/store';
import './filters/registerGlobals';
import i18n from './libs/i18n';

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

export default new Vue({
  el: '#app',
  router,
  store: getStore(),
  render: h => h(AppComponent),
});
