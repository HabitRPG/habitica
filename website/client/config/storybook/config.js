/* eslint-disable import/no-extraneous-dependencies */
import { configure } from '@storybook/vue';
import './margin.css';
import '../../src/assets/scss/index.scss';
import '../../src/assets/scss/spacing.scss';
import '../../src/assets/css/sprites.css';

import '../../src/assets/css/sprites/spritesmith-main-0.css';
import '../../src/assets/css/sprites/spritesmith-main-1.css';
import '../../src/assets/css/sprites/spritesmith-main-2.css';
import '../../src/assets/css/sprites/spritesmith-main-3.css';
import '../../src/assets/css/sprites/spritesmith-main-4.css';
import '../../src/assets/css/sprites/spritesmith-main-5.css';
import '../../src/assets/css/sprites/spritesmith-main-6.css';
import '../../src/assets/css/sprites/spritesmith-main-7.css';
import '../../src/assets/css/sprites/spritesmith-main-8.css';
import '../../src/assets/css/sprites/spritesmith-main-9.css';
import '../../src/assets/css/sprites/spritesmith-main-10.css';
import '../../src/assets/css/sprites/spritesmith-main-11.css';
import '../../src/assets/css/sprites/spritesmith-main-12.css';
import '../../src/assets/css/sprites/spritesmith-main-13.css';
import '../../src/assets/css/sprites/spritesmith-main-14.css';
import '../../src/assets/css/sprites/spritesmith-main-15.css';
import '../../src/assets/css/sprites/spritesmith-main-16.css';
import '../../src/assets/css/sprites/spritesmith-main-17.css';
import '../../src/assets/css/sprites/spritesmith-main-18.css';
import '../../src/assets/css/sprites/spritesmith-main-19.css';
import '../../src/assets/css/sprites/spritesmith-main-20.css';
import '../../src/assets/css/sprites/spritesmith-main-21.css';
import '../../src/assets/css/sprites/spritesmith-main-22.css';
import '../../src/assets/css/sprites/spritesmith-main-23.css';
import '../../src/assets/css/sprites/spritesmith-main-24.css';
import '../../src/assets/css/sprites/spritesmith-main-25.css';
import '../../src/assets/css/sprites/spritesmith-main-26.css';
import Vue from 'vue';
import BootstrapVue from 'bootstrap-vue';
import StoreModule from '@/libs/store';

// couldn't inject the languages easily,
// so just a "$t()"  string to show that this will be translated
Vue.prototype.$t = function translateString (...args) {
  return `$t(${JSON.stringify(args)})`;
};

Vue.use(BootstrapVue);
Vue.use(StoreModule);

const req = require.context('../../src', true, /.stories.js$/);

function loadStories () {
  req.keys().forEach(filename => req(filename));
}

configure(loadStories, module);
