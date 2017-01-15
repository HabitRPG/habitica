// TODO verify if it's needed, added because Axios require Promise in the global scope
// and babel-runtime doesn't affect external libraries
require('babel-polyfill');

import Vue from 'vue';
import axios from 'axios';
import AppComponent from './app';
import router from './router';
import store from './store';
import './filters/registerGlobals';
import i18n from './plugins/i18n';

Vue.use(i18n);

// TODO just for the beginning
let authSettings = localStorage.getItem('habit-mobile-settings');

if (authSettings) {
  authSettings = JSON.parse(authSettings);
  axios.defaults.headers.common['x-api-user'] = authSettings.auth.apiId;
  axios.defaults.headers.common['x-api-key'] = authSettings.auth.apiToken;
}

const app = new Vue({
  router,
  render: h => h(AppComponent),
  mounted () { // Remove the loading screen when the app is mounted
    let loadingScreen = document.getElementById('loading-screen');
    if (loadingScreen) document.body.removeChild(loadingScreen);
  },
});

// Setup listener for title
store.watch(state => state.title, (title) => {
  document.title = title;
});

// Mount the app when user and tasks are loaded
let userDataWatcher = store.watch(state => [state.user, state.tasks], ([user, tasks]) => {
  if (user && user._id && tasks && tasks.length) {
    userDataWatcher(); // remove the watcher
    app.$mount('#app');
  }
});

// Load the user and the user tasks
Promise.all([
  store.dispatch('user:fetch'),
  store.dispatch('tasks:fetchUserTasks'),
]).catch(() => {
  alert('Impossible to fetch user. Copy into localStorage a valid habit-mobile-settings object.');
});
