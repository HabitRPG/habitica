import Vue from 'vue';
import Vuex from 'vuex';
import * as mutations from './mutations';
import * as actions from './actions';

Vue.use(Vuex);

const state = {
  title: 'Habitica',
  user: {},
};

export default new Vuex.Store({
  state,
  mutations,
  actions,
});