import Vue from 'vue';
import axios from 'axios';
import {
  ModalPlugin,
  DropdownPlugin,
  PopoverPlugin,
  FormPlugin,
  FormInputPlugin,
  FormRadioPlugin,
  TooltipPlugin,
  NavbarPlugin,
  CollapsePlugin,
} from 'bootstrap-vue';
import Fragment from 'vue-fragment';
import AppComponent from './app';
import {
  setup as setupAnalytics,
} from '@/libs/analytics';
import { setUpLogging } from '@/libs/logging';
import router from './router/index';
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

// window['habitica-i18n] is injected by the server
Vue.use(i18n, { i18nData: window && window['habitica-i18n'] });
Vue.use(StoreModule);
Vue.use(ModalPlugin);
Vue.use(DropdownPlugin);
Vue.use(PopoverPlugin);
Vue.use(FormPlugin);
Vue.use(FormInputPlugin);
Vue.use(FormRadioPlugin);
Vue.use(TooltipPlugin);
Vue.use(NavbarPlugin);
Vue.use(CollapsePlugin);
Vue.use(Fragment.Plugin);

setUpLogging();
setupAnalytics(); // just create queues for analytics, no scripts loaded at this time
const store = getStore();

if (process.env.TIME_TRAVEL_ENABLED === 'true') {
  (async () => {
    const sinon = await import('sinon');
    if (axios.defaults.headers.common['x-api-user']) {
      const response = await axios.get('/api/v4/debug/time-travel-time');
      const time = new Date(response.data.data.time);
      Vue.config.clock = sinon.useFakeTimers({
        now: time,
        shouldAdvanceTime: true,
      });
    }
  })();
}

const vueInstance = new Vue({
  el: '#app',
  router,
  store,
  render: h => h(AppComponent),
});

export default vueInstance;

window.externalLink = url => {
  vueInstance.$root.$emit('habitica:external-link', url);
};
