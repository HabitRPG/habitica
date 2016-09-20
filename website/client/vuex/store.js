import Vue from 'vue';
import Vuex from 'vuex';

Vue.use(Vuex);

const state = {
  title: 'Habitica',
};

export default new Vuex.Store({
  state,
});