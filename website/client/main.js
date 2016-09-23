// TODO verify if it's needed, added because Vuex require Promise in the global scope
// and babel-runtime doesn't affect external libraries
require('babel-polyfill');

import Vue from 'vue';
import VuexRouterSync from 'vuex-router-sync';
import VueResource from 'vue-resource';
import AppComponent from './components/app';
import router from './router';
import store from './vuex/store';

Vue.use(VueResource);
Vue.http.headers.common['x-api-user'] = '';
Vue.http.headers.common['x-api-key'] = '';

// Sync Vuex and Router
VuexRouterSync.sync(store, router);

const app =  new Vue({ // eslint-disable-line no-new
  router,
  store,
  render: h => h(AppComponent),
  mounted () { // Remove the loading screen when the app is mounted
    let loadingScreen = document.getElementById('loading-screen');
    if (loadingScreen) document.body.removeChild(loadingScreen);
  },
});

// Setup listener for title that is outside Vue's scope
store.watch(state => state.title, (title) => {
  document.title = title;
});

// Mount the app when the user is loaded
let userWatcher = store.watch(state => state.user, (user) => {
  if (user && user._id) {
    userWatcher(); // remove the watcher
    app.$mount('#app');
  }
});
