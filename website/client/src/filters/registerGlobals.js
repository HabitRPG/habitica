import Vue from 'vue';
import round from './round';
import floor from './floor';
import roundBigNumber from './roundBigNumber';
import floorWholeNumber from './floorWholeNumber';
import localizeNumber from './localizeNumber';

Vue.filter('round', round);
Vue.filter('floor', floor);
Vue.filter('roundBigNumber', roundBigNumber);
Vue.filter('floorWholeNumber', floorWholeNumber);
Vue.filter('localizeNumber', localizeNumber);
