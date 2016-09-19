import Vue from 'vue';
import App from './components/App';
import router from './router';

new Vue({ // eslint-disable-line no-new
  router,
  el: '#app',
  render: h => h(App),
});
