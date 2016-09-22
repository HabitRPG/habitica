// TODO verify if it's needed, added because Vuex require Promise in the global scope
// and babel-runtime doesn't affect external libraries
require('babel-polyfill');

import Vue from 'vue';
import VuexRouterSync from 'vuex-router-sync';
import VueResource from 'vue-resource';
import App from './components/app';
import router from './router';
import store from './vuex/store';

Vue.use(VueResource);
Vue.http.headers.common['x-api-user'] = '';
Vue.http.headers.common['x-api-key'] = '';

// Sync Vuex and Router
VuexRouterSync.sync(store, router);

// Setup listener for title that is outside Vue's scope
store.watch(state => state.title, (newTitle) => {
  document.title = newTitle;
});

// Load the user and then render the app
store.dispatch('fetchUser').then(() => {
  new Vue({ // eslint-disable-line no-new
    router,
    store,
    el: '#app',
    render: h => h(App),
    mounted () {
      // Remove loading screen
      let loadingScreen = document.getElementById('loading-screen');
      if (loadingScreen) document.body.removeChild(loadingScreen);
    },
  });
}).catch(() => {
  // TODO redirect to logout
});


