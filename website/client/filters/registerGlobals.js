import Vue from 'vue';
import round from './round';
import floor from './floor';

Vue.filter('round', round);
Vue.filter('floor', floor);
