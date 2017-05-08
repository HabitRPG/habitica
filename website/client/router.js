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
import InboxPage from './components/social/inbox/index';
import InboxConversationPage from './components/social/inbox/conversationPage';

// Guilds
import GuildIndex from './components/guilds/index';
import TavernPage from './components/guilds/tavern';
import MyGuilds from './components/guilds/myGuilds';
import GuildsDiscoveryPage from './components/guilds/discovery';
import GuildPage from './components/guilds/guild';

Vue.use(VueRouter);

export default new VueRouter({
  mode: 'history',
  base: process.env.NODE_ENV === 'production' ? '/new-app' : __dirname, // eslint-disable-line no-process-env
  linkActiveClass: 'active',
  // When navigating to another route always scroll to the top
  // To customize the behavior see https://router.vuejs.org/en/advanced/scroll-behavior.html
  scrollBehavior () {
    return { x: 0, y: 0 };
  },
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
      path: '/guilds',
      component: GuildIndex,
      children: [
        { name: 'tavern', path: 'tavern', component: TavernPage },
        {
          name: 'myGuilds',
          path: 'myGuilds',
          component: MyGuilds,
        },
        {
          name: 'guildsDiscovery',
          path: 'discovery',
          component: GuildsDiscoveryPage,
        },
        {
          name: 'guild',
          path: 'guild/:guildId',
          component: GuildPage,
          props: true,
        },
      ],
    },
    {
      path: '/social',
      component: SocialContainer,
      children: [
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
