import Vue from 'vue';
import VueRouter from 'vue-router';
import UserTasks from './components/userTasks';
import ParentPage from './components/parentPage';
import Page from './components/page';

Vue.use(VueRouter);

export default new VueRouter({
  mode: 'history',
  base: process.env.NODE_ENV === 'production' ? '/new-app' : __dirname, // eslint-disable-line no-process-env
  routes: [
    { path: '/', component: UserTasks },
    {
      path: '/inventory',
      component: ParentPage,
      children: [
        {path: '', component: Page},
        {path: 'equipment', component: Page},
        {path: 'stable', component: Page},
      ],
    },
    { path: '/market', component: Page },
    {
      path: '/social',
      component: ParentPage,
      children: [
        {path: 'tavern', component: Page},
        {path: 'inbox', component: Page},
        {path: 'challenges', component: Page},
        {path: 'party', component: Page},
        {path: 'guilds', component: Page},
      ],
    },
    {
      path: '/user',
      component: ParentPage,
      children: [
        {path: 'avatar', component: Page},
        {path: 'stats', component: Page},
        {path: 'achievements', component: Page},
        {path: 'settings', component: Page},
      ],
    },
  ],
});