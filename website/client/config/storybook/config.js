/* eslint-disable import/no-extraneous-dependencies */
import { configure } from '@storybook/vue';
import './margin.css';
import '../../src/assets/scss/index.scss';
import '../../src/assets/scss/sprites.scss';

import Vue from 'vue';
import BootstrapVue from 'bootstrap-vue';
import i18n from 'habitica/website/common/script/i18n';
import StoreModule from '@/libs/store';
import getStore from '@/store';
import '../../src/filters/registerGlobals';

// couldn't inject the languages easily,
// so just a "$t()" string to show that this will be translated
i18n.t = function translateString (...args) {
  return `$t(${JSON.stringify(args)})`;
};
Vue.prototype.$t = i18n.t;

Vue.use(BootstrapVue);
Vue.use(StoreModule);

const store = getStore();
store.state.user.data = {
  stats: {},
  tags: [],
  items: {
    quests: {
      moon1: 3,
    },
  },
  party: {
    quest: {

    },
  },
  preferences: {

  },
  auth: {
    local: {
      // email: 'example@example.com',
    },
    facebook: {
      emails: [
        {
          value: 'test@test.de',
        },
      ],
    },
  },
};

Vue.prototype.$store = store;

const req = require.context('../../src', true, /.stories.js$/);

function loadStories () {
  req.keys().forEach(filename => req(filename));
}

configure(loadStories, module);
