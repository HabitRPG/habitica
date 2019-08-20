import { configure } from '@storybook/vue';

import i18n from '../website/client/libs/i18n';
import Vue from 'vue';
import BootstrapVue from 'bootstrap-vue';

// automatically import all files ending in *.stories.js
const req = require.context('../stories', true, /\.stories\.js$/);
function loadStories() {
  req.keys().forEach(filename => req(filename));
}



Vue.use(i18n, {i18nData: window && window['habitica-i18n']});
Vue.use(BootstrapVue);

configure(loadStories, module);
