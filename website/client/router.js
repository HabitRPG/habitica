import Vue from 'vue';
import VueRouter from 'vue-router';
import Home from './components/home';
import Page from './components/page';

Vue.use(VueRouter);

export default new VueRouter({
  mode: 'history',
  base: process.env.NODE_ENV === 'production' ? '/new-app' : __dirname, // eslint-disable-line no-process-env
  routes: [
    { path: '/', component: Home },
    { path: '/page', component: Page },
  ],
});