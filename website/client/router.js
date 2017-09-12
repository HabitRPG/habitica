import Vue from 'vue';
import VueRouter from 'vue-router';
import getStore from 'client/store';
import * as Analytics from 'client/libs/analytics';

// import EmptyView from './components/emptyView';

// TODO Dummy elements used as placeholder until real components are implemented
import ParentPage from './components/parentPage';

// Static Pages
const StaticWrapper = () => import(/* webpackChunkName: "static" */'./components/static/staticWrapper');

const RegisterLogin = () => import(/* webpackChunkName: "auth" */'./components/auth/registerLogin');

// User Pages
// const StatsPage = () => import(/* webpackChunkName: "user" */'./components/userMenu/stats');
// const AchievementsPage = () => import(/* webpackChunkName: "user" */'./components/userMenu/achievements');
const ProfilePage = () => import(/* webpackChunkName: "user" */'./components/userMenu/profilePage');

// Settings
const Settings = () => import(/* webpackChunkName: "settings" */'./components/settings/index');
const API = () => import(/* webpackChunkName: "settings" */'./components/settings/api');
const DataExport = () => import(/* webpackChunkName: "settings" */'./components/settings/dataExport');
const Notifications = () => import(/* webpackChunkName: "settings" */'./components/settings/notifications');
const PromoCode = () => import(/* webpackChunkName: "settings" */'./components/settings/promoCode');
const Site = () => import(/* webpackChunkName: "settings" */'./components/settings/site');
const Subscription = () => import(/* webpackChunkName: "settings" */'./components/settings/subscription');

// Hall
const HallPage = () => import(/* webpackChunkName: "hall" */'./components/hall/index');
const PatronsPage = () => import(/* webpackChunkName: "hall" */'./components/hall/patrons');
const HeroesPage = () => import(/* webpackChunkName: "hall" */'./components/hall/heroes');

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

// Guilds
const GuildIndex = () => import(/* webpackChunkName: "guilds" */ './components/groups/index');
const TavernPage = () => import(/* webpackChunkName: "guilds" */ './components/groups/tavern');
const MyGuilds = () => import(/* webpackChunkName: "guilds" */ './components/groups/myGuilds');
const GuildsDiscoveryPage = () => import(/* webpackChunkName: "guilds" */ './components/groups/discovery');
const GroupPage = () => import(/* webpackChunkName: "guilds" */ './components/groups/group');
const GroupPlansAppPage = () => import(/* webpackChunkName: "guilds" */ './components/groups/groupPlan');

// Group Plans
const GroupPlanIndex = () => import(/* webpackChunkName: "group-plans" */ './components/group-plans/index');
const GroupPlanTaskInformation = () => import(/* webpackChunkName: "group-plans" */ './components/group-plans/taskInformation');

// Challenges
const ChallengeIndex = () => import(/* webpackChunkName: "challenges" */ './components/challenges/index');
const MyChallenges = () => import(/* webpackChunkName: "challenges" */ './components/challenges/myChallenges');
const FindChallenges = () => import(/* webpackChunkName: "challenges" */ './components/challenges/findChallenges');
const ChallengeDetail = () => import(/* webpackChunkName: "challenges" */ './components/challenges/challengeDetail');

// Shops
const ShopsContainer = () => import(/* webpackChunkName: "shops" */'./components/shops/index');
const MarketPage = () => import(/* webpackChunkName: "shops-market" */'./components/shops/market/index');
const QuestsPage = () => import(/* webpackChunkName: "shops-quest" */'./components/shops/quests/index');
const SeasonalPage = () => import(/* webpackChunkName: "shops-seasonal" */'./components/shops/seasonal/index');
const TimeTravelersPage = () => import(/* webpackChunkName: "shops-timetravelers" */'./components/shops/timeTravelers/index');

Vue.use(VueRouter);

const router = new VueRouter({
  mode: 'history',
  base: process.env.NODE_ENV === 'production' ? '/' : __dirname, // eslint-disable-line no-process-env
  linkActiveClass: 'active',
  // When navigating to another route always scroll to the top
  // To customize the behavior see https://router.vuejs.org/en/advanced/scroll-behavior.html
  scrollBehavior () {
    return { x: 0, y: 0 };
  },
  // requiresLogin is true by default, isStatic false
  routes: [
    { name: 'home', path: '/home', component: StaticWrapper, meta: {requiresLogin: false} },
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
    {
      path: '/shops',
      component: ShopsContainer,
      children: [
        { name: 'market', path: 'market', component: MarketPage },
        { name: 'quests', path: 'quests', component: QuestsPage },
        { name: 'seasonal', path: 'seasonal', component: SeasonalPage },
        { name: 'time', path: 'time', component: TimeTravelersPage },
      ],
    },
    { name: 'party', path: '/party', component: GroupPage },
    { name: 'groupPlan', path: '/group-plans', component: GroupPlansAppPage },
    {
      name: 'groupPlanDetail',
      path: '/group-plans/:groupId',
      component: GroupPlanIndex,
      props: true,
      children: [
        {
          name: 'groupPlanDetailTaskInformation',
          path: '/group-plans/:groupId/task-information',
          component: GroupPlanTaskInformation,
          props: true,
        },
        {
          name: 'groupPlanDetailInformation',
          path: '/group-plans/:groupId/information',
          component: GroupPage,
          props: true,
        },
      ],
    },
    {
      path: '/groups',
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
          path: 'guild/:groupId',
          component: GroupPage,
          props: true,
        },
      ],
    },
    {
      name: 'challenges',
      path: '/challenges',
      component: ChallengeIndex,
      children: [
        {
          name: 'myChallenges',
          path: 'myChallenges',
          component: MyChallenges,
        },
        {
          name: 'findChallenges',
          path: 'findChallenges',
          component: FindChallenges,
        },
        {
          name: 'challenge',
          path: ':challengeId',
          component: ChallengeDetail,
          props: true,
        },
      ],
    },
    {
      path: '/user',
      component: ParentPage,
      children: [
        { name: 'stats', path: 'stats', component: ProfilePage },
        { name: 'achievements', path: 'achievements', component: ProfilePage },
        { name: 'profile', path: 'profile', component: ProfilePage },
        {
          name: 'settings',
          path: 'settings',
          component: Settings,
          children: [
            {
              name: 'site',
              path: 'site',
              component: Site,
            },
            {
              name: 'api',
              path: 'api',
              component: API,
            },
            {
              name: 'dataExport',
              path: 'data-export',
              component: DataExport,
            },
            {
              name: 'promoCode',
              path: 'promo-code',
              component: PromoCode,
            },
            {
              name: 'subscription',
              path: 'subscription',
              component: Subscription,
            },
            {
              name: 'notifications',
              path: 'notifications',
              component: Notifications,
            },
          ],
        },
      ],
    },
    {
      path: '/static',
      component: ParentPage,
      children: [
        { name: 'app', path: 'app', component: StaticWrapper, meta: {requiresLogin: false}},
        { name: 'clearBrowserData', path: 'clear-browser-data', component: StaticWrapper, meta: {requiresLogin: false}},
        { name: 'communityGuidelines', path: 'community-guidelines', component: StaticWrapper, meta: {requiresLogin: false}},
        { name: 'contact', path: 'contact', component: StaticWrapper, meta: {requiresLogin: false}},
        { name: 'faq', path: 'faq', component: StaticWrapper, meta: {requiresLogin: false}},
        { name: 'features', path: 'features', component: StaticWrapper, meta: {requiresLogin: false}},
        { name: 'groupPlans', path: 'group-plans', component: StaticWrapper, meta: {requiresLogin: false}},
        // { name: 'maintenance', path: 'maintenance', component: StaticWrapper, meta: {requiresLogin: false}},
        // { name: 'maintenance-info', path: 'maintenance-info', component: StaticWrapper, meta: {requiresLogin: false}},
        { name: 'merch', path: 'merch', component: StaticWrapper, meta: {requiresLogin: false}},
        { name: 'overview', path: 'overview', component: StaticWrapper, meta: {requiresLogin: false}},
        { name: 'plans', path: 'plans', component: StaticWrapper, meta: {requiresLogin: false}},
        { name: 'pressKit', path: 'press-kit', component: StaticWrapper, meta: {requiresLogin: false}},
        { name: 'privacy', path: 'privacy', component: StaticWrapper, meta: {requiresLogin: false}},
        { name: 'terms', path: 'terms', component: StaticWrapper, meta: {requiresLogin: false}},
        // { name: 'videos', path: 'videos', component: StaticWrapper, meta: {requiresLogin: false}},
      ],
    },
    {
      path: '/hall',
      component: HallPage,
      children: [
        { name: 'patrons', path: 'patrons', component: PatronsPage },
        { name: 'contributors', path: 'contributors', component: HeroesPage },
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

  if (isUserLoggedIn && (to.name === 'login' || to.name === 'register')) {
    return next({name: 'tasks'});
  }

  Analytics.track({
    hitType: 'pageview',
    eventCategory: 'navigation',
    eventAction: 'navigate',
    page: to.name || to.path,
  });

  next();
});

export default router;
