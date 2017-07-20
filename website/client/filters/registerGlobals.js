import Vue from 'vue';
import round from './round';
import floor from './floor';
import roundBigNumber from './roundBigNumber';
import markdown from './markdown';

Vue.filter('round', round);
Vue.filter('floor', floor);
Vue.filter('roundBigNumber', roundBigNumber);
Vue.filter('markdown', markdown);