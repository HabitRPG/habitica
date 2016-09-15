import Vue from 'vue';
import App from './App';

new Vue({ // eslint-disable-line no-new
  el: '#app',
  render: h => h(App),
});

console.log('Rendered!')
