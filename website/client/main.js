import Vue from 'vue';
import AppComponent from './app';
import {
  setup as setupAnalytics,
} from 'client/libs/analytics';
import { setUpLogging } from 'client/libs/logging';
import router from './router';
import getStore from './store';
import StoreModule from './libs/store';
import './filters/registerGlobals';
import i18n from './libs/i18n';

import BootstrapVue from 'bootstrap-vue';

const IS_PRODUCTION = process.env.NODE_ENV === 'production'; // eslint-disable-line no-process-env

// Configure Vue global options, see https://vuejs.org/v2/api/#Global-Config

// Enable perf timeline measuring for Vue components in Chrome Dev Tools
// Note: this has been disabled because it caused some perf issues
// if rendering becomes too slow in dev mode, we should turn it off
// See https://github.com/vuejs/vue/issues/5174
Vue.config.performance = !IS_PRODUCTION;
// Disable annoying reminder abour production build in dev mode
Vue.config.productionTip = IS_PRODUCTION;

// window['habitica-i18n] is injected by the server
Vue.use(i18n, {i18nData: window && window['habitica-i18n']});
Vue.use(StoreModule);
Vue.use(BootstrapVue);

setUpLogging();
setupAnalytics(); // just create queues for analytics, no scripts loaded at this time
const store = getStore();

export default new Vue({
  el: '#app',
  router,
  store,
  render: h => h(AppComponent),
});
