import Vue from 'vue';
import VueRouter from 'vue-router';
import Hello from './components/Hello';
import Sub from './components/Sub';

Vue.use(VueRouter);

export default new VueRouter({
  mode: 'history',
  base: __dirname,
  routes: [
    { path: '/', component: Hello },
    { path: '/sub', component: Sub },
  ],
});