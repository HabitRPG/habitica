import Vue from 'vue';
import VueRouter from 'vue-router';
import getStore from 'client/store';

import EmptyView from './components/emptyView';

// TODO Dummy elements used as placeholder until real components are implemented
import ParentPage from './components/parentPage';
import Page from './components/page';

// Static Pages
const Home = () => import(/* webpackChunkName: "static" */'./components/static/home');
const RegisterLogin = () => import(/* webpackChunkName: "auth" */'./components/auth/registerLogin');

// User Pages
const CreatorIntro = () => import(/* webpackChunkName: "creator" */'./components/creatorIntro');
const BackgroundsPage = () => import(/* webpackChunkName: "user" */'./components/userMenu/backgrounds');
const StatsPage = () => import(/* webpackChunkName: "user" */'./components/userMenu/stats');

// Except for tasks that are always loaded all the other main level
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

const router = new VueRouter({
  mode: 'history',
  base: process.env.NODE_ENV === 'production' ? '/new-app' : __dirname, // eslint-disable-line no-process-env
  linkActiveClass: 'active',
  // When navigating to another route always scroll to the top
  // To customize the behavior see https://router.vuejs.org/en/advanced/scroll-behavior.html
  scrollBehavior () {
    return { x: 0, y: 0 };
  },
  // requiresLogin is true by default, isStatic false
  routes: [
    { name: 'creator', path: '/creator', component: CreatorIntro },
    { name: 'home', path: '/home', component: Home, meta: {requiresLogin: false} },
    { name: 'register', path: '/register', component: RegisterLogin, meta: {requiresLogin: false} },
    { name: 'login', path: '/login', component: RegisterLogin, meta: {requiresLogin: false} },
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
    { name: 'party', path: '/party', component: GuildPage },
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
        { name: 'backgrounds', path: 'backgrounds', component: BackgroundsPage },
        { name: 'stats', path: 'stats', component: StatsPage },
        { name: 'achievements', path: 'achievements', component: Page },
        { name: 'settings', path: 'settings', component: Page },
      ],
    },
  ],
});

const store = getStore();

router.beforeEach(function routerGuard (to, from, next) {
  const isUserLoggedIn = store.state.isUserLoggedIn;
  const routeRequiresLogin = to.meta.requiresLogin !== false;

  if (!isUserLoggedIn && routeRequiresLogin) {
    // Redirect to the login page unless the user is trying to reach the
    // root of the website, in which case show the home page.
    // TODO when redirecting to login if user login then redirect back to initial page
    // so if you tried to go to /party you'll be redirected to /party after login/signup
    return next({name: to.path === '/' ? 'home' : 'login'});
  }

  next();
});

export default router;
