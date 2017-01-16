import Vue from 'vue';
import VueRouter from 'vue-router';
import UserTasks from './components/userTasks';
import ParentPage from './components/parentPage';
import Page from './components/page';

// Social
import SocialPage from './components/SocialPage';
import TavernPage from './components/Social/TavernPage';
import InboxPage from './components/Inbox/InboxPage';
import InboxConversationPage from './components/Inbox/InboxConversationPage';


Vue.use(VueRouter);

export default new VueRouter({
  mode: 'history',
  base: process.env.NODE_ENV === 'production' ? '/new-app' : __dirname, // eslint-disable-line no-process-env
  linkActiveClass: 'active',
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
      component: SocialPage,
      children: [
        { name: 'tavern', path: 'tavern', component: TavernPage },
        {
          path: 'inbox',
          component: ParentPage,
          children: [
            {
              name: 'inbox',
              path: '',
              component: InboxPage,
            },
            {
              name: 'conversation',
              path: 'conversation/:id',
              component: InboxConversationPage,
            },
          ],
        },
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
