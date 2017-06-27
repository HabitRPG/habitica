import Vue from 'vue';
import VueRouter from 'vue-router';

import EmptyView from './components/emptyView';

// TODO Dummy elements used as placeholder until real components are implemented
import ParentPage from './components/parentPage';
import Page from './components/page';

// Static Pages
const Home = () => import(/* webpackChunkName: "static" */'./components/static/home');
const RegisterLogin = () => import(/* webpackChunkName: "auth" */'./components/auth/registerLogin');

// Tasks
import UserTasks from './components/userTasks';

// All the main level
// components are loaded in separate webpack chunks.
// See https://webpack.js.org/guides/code-splitting-async/
// for docs

// Tasks
const UserTasks = () => import(/* webpackChunkName: "userTasks" */'./components/tasks/user');

// Inventory
const InventoryContainer = () => import(/* webpackChunkName: "inventory" */'./components/inventory/index');
const ItemsPage = () => import(/* webpackChunkName: "inventory" */'./components/inventory/items/index');
const EquipmentPage = () => import(/* webpackChunkName: "inventory" */'./components/inventory/equipment/index');
const StablePage = () => import(/* webpackChunkName: "inventory" */'./components/inventory/stable/index');

// Social
const InboxPage = () => import(/* webpackChunkName: "inbox" */ './components/social/inbox/index');
const InboxConversationPage = () => import(/* webpackChunkName: "inbox" */ './components/social/inbox/conversationPage');

// Guilds
const GuildIndex = () => import(/* webpackChunkName: "guilds" */ './components/guilds/index');
const TavernPage = () => import(/* webpackChunkName: "guilds" */ './components/guilds/tavern');
const MyGuilds = () => import(/* webpackChunkName: "guilds" */ './components/guilds/myGuilds');
const GuildsDiscoveryPage = () => import(/* webpackChunkName: "guilds" */ './components/guilds/discovery');
const GuildPage = () => import(/* webpackChunkName: "guilds" */ './components/guilds/guild');

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
    { name: 'home', path: '/home', component: Home },
    { name: 'register', path: '/register', component: RegisterLogin },
    { name: 'login', path: '/login', component: RegisterLogin },
    { name: 'tasks', path: '/', component: UserTasks },
    {
      path: '/inventory',
      component: InventoryContainer,
      children: [
        { name: 'items', path: 'items', component: ItemsPage },
        { name: 'equipment', path: 'equipment', component: EquipmentPage },
        { name: 'stable', path: 'stable', component: StablePage },
      ],
    },
    { name: 'shops', path: '/shops', component: Page },
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
    { name: 'challenges', path: 'challenges', component: Page },
    { name: 'party', path: 'party', component: Page },
    {
      path: '/user',
      component: ParentPage,
      children: [
        { name: 'avatar', path: 'avatar', component: Page },
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
        { name: 'stats', path: 'stats', component: Page },
        { name: 'achievements', path: 'achievements', component: Page },
        { name: 'settings', path: 'settings', component: Page },
      ],
    },
  ],
});
