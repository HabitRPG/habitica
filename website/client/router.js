import Vue from 'vue';
import VueRouter from 'vue-router';

import EmptyView from './components/emptyView';
// TODO Dummy elements used as placeholder until real components are implemented
import ParentPage from './components/parentPage';
import Page from './components/page';

// Tasks
import UserTasks from './components/userTasks';

// Inventory
import InventoryContainer from './components/inventory/index';
import StablePage from './components/inventory/stable';

// Social
import SocialContainer from './components/social/index';
import TavernPage from './components/social/tavern';
import InboxPage from './components/social/inbox/index';
import InboxConversationPage from './components/social/inbox/conversationPage';
import GuildsDiscoveryPage from './components/social/guilds/discovery/index';

Vue.use(VueRouter);

export default new VueRouter({
  mode: 'history',
  base: process.env.NODE_ENV === 'production' ? '/new-app' : __dirname, // eslint-disable-line no-process-env
  linkActiveClass: 'active',
  routes: [
    { name: 'tasks', path: '/', component: UserTasks },
    {
      path: '/inventory',
      component: InventoryContainer,
      children: [
        { name: 'inventory', path: '', component: Page },
        { name: 'equipment', path: 'equipment', component: Page },
        { name: 'stable', path: 'stable', component: StablePage },
      ],
    },
    { name: 'market', path: '/market', component: Page },
    {
      path: '/social',
      component: SocialContainer,
      children: [
        { name: 'tavern', path: 'tavern', component: TavernPage },
        {
          path: 'inbox',
          component: EmptyView,
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
        { name: 'challenges', path: 'challenges', component: Page },
        { name: 'party', path: 'party', component: Page },
        {
          path: 'guilds',
          component: EmptyView,
          children: [
            {
              name: 'guilds',
              path: '',
              component: GuildsDiscoveryPage,
            },
          ],
        },
      ],
    },
    {
      path: '/user',
      component: ParentPage,
      children: [
        { name: 'avatar', path: 'avatar', component: Page },
        { name: 'stats', path: 'stats', component: Page },
        { name: 'achievements', path: 'achievements', component: Page },
        { name: 'settings', path: 'settings', component: Page },
      ],
    },
  ],
});
