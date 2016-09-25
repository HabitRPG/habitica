// TODO verify if it's needed, added because Vuex require Promise in the global scope
// and babel-runtime doesn't affect external libraries
require('babel-polyfill');

import Vue from 'vue';
import VueResource from 'vue-resource';
import AppComponent from './components/app';
import router from './router';
import store from './store';

// TODO just for the beginning
Vue.use(VueResource);

let authSettings = localStorage.getItem('habit-mobile-settings');

if (authSettings) {
  authSettings = JSON.parse(authSettings);
  Vue.http.headers.common['x-api-user'] = authSettings.auth.apiId;
  Vue.http.headers.common['x-api-key'] = authSettings.auth.apiToken;
}

const app =  new Vue({
  router,
  render: h => h(AppComponent),
  mounted () { // Remove the loading screen when the app is mounted
    let loadingScreen = document.getElementById('loading-screen');
    if (loadingScreen) document.body.removeChild(loadingScreen);
  },
});

// Setup listener for title
store.$watch(state => state.title, (title) => {
  document.title = title;
});

setTimeout(() => {
  store.state.user.profile = {name: 'aaa'};
}, 1000);

// Mount the app when the user is loaded
let userWatcher = store.$watch(state => state.user, (user) => {
  if (user && user._id) {
    userWatcher(); // remove the watcher
    app.$mount('#app');
  }
});

// Load the user
store.dispatch('fetchUser')
  .catch(() => {
    alert('Impossible to fetch user. Copy into localStorage a valid habit-mobile-settings object.');
  });
