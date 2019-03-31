import Vue from 'vue';
import VueRouter from 'vue-router';
import getStore from 'client/store';
import * as Analytics from 'client/libs/analytics';
import handleRedirect from './handleRedirect';

import ParentPage from 'client/components/parentPage';

// Static Pages
const StaticWrapper = () => import(/* webpackChunkName: "entry" */'client/components/static/staticWrapper');
const HomePage = () => import(/* webpackChunkName: "entry" */'client/components/static/home');

const AppPage = () => import(/* webpackChunkName: "static" */'client/components/static/app');
const ClearBrowserDataPage = () => import(/* webpackChunkName: "static" */'client/components/static/clearBrowserData');
const CommunityGuidelinesPage = () => import(/* webpackChunkName: "static" */'client/components/static/communityGuidelines');
const ContactPage = () => import(/* webpackChunkName: "static" */'client/components/static/contact');
const FAQPage = () => import(/* webpackChunkName: "static" */'client/components/static/faq');
const FeaturesPage = () => import(/* webpackChunkName: "static" */'client/components/static/features');
const GroupPlansPage = () => import(/* webpackChunkName: "static" */'client/components/static/groupPlans');
const MerchPage = () => import(/* webpackChunkName: "static" */'client/components/static/merch');
const NewsPage = () => import(/* webpackChunkName: "static" */'client/components/static/newStuff');
const OverviewPage = () => import(/* webpackChunkName: "static" */'client/components/static/overview');
const PressKitPage = () => import(/* webpackChunkName: "static" */'client/components/static/pressKit');
const PrivacyPage = () => import(/* webpackChunkName: "static" */'client/components/static/privacy');
const TermsPage = () => import(/* webpackChunkName: "static" */'client/components/static/terms');

const RegisterLoginReset = () => import(/* webpackChunkName: "auth" */'client/components/auth/registerLoginReset');
const Logout = () => import(/* webpackChunkName: "auth" */'client/components/auth/logout');

// User Pages
// const StatsPage = () => import(/* webpackChunkName: "user" */'./components/userMenu/stats');
// const AchievementsPage = () => import(/* webpackChunkName: "user" */'./components/userMenu/achievements');
const ProfilePage = () => import(/* webpackChunkName: "user" */'client/components/userMenu/profilePage');

// Settings
const Settings = () => import(/* webpackChunkName: "settings" */'client/components/settings/index');
const API = () => import(/* webpackChunkName: "settings" */'client/components/settings/api');
const DataExport = () => import(/* webpackChunkName: "settings" */'client/components/settings/dataExport');
const Notifications = () => import(/* webpackChunkName: "settings" */'client/components/settings/notifications');
const PromoCode = () => import(/* webpackChunkName: "settings" */'client/components/settings/promoCode');
const Site = () => import(/* webpackChunkName: "settings" */'client/components/settings/site');
const Subscription = () => import(/* webpackChunkName: "settings" */'client/components/settings/subscription');

// Hall
const HallPage = () => import(/* webpackChunkName: "hall" */'client/components/hall/index');
const PatronsPage = () => import(/* webpackChunkName: "hall" */'client/components/hall/patrons');
const HeroesPage = () => import(/* webpackChunkName: "hall" */'client/components/hall/heroes');

// Except for tasks that are always loaded all the other main level
// All the main level
// components are loaded in separate webpack chunks.
// See https://webpack.js.org/guides/code-splitting-async/
// for docs

// Tasks
const UserTasks = () => import(/* webpackChunkName: "userTasks" */'client/components/tasks/user');

// Inventory
const InventoryContainer = () => import(/* webpackChunkName: "inventory" */'client/components/inventory/index');
const ItemsPage = () => import(/* webpackChunkName: "inventory" */'client/components/inventory/items/index');
const EquipmentPage = () => import(/* webpackChunkName: "inventory" */'client/components/inventory/equipment/index');
const StablePage = () => import(/* webpackChunkName: "inventory" */'client/components/inventory/stable/index');

// Guilds
const GuildIndex = () => import(/* webpackChunkName: "guilds" */ 'client/components/groups/index');
const TavernPage = () => import(/* webpackChunkName: "guilds" */ 'client/components/groups/tavern');
const MyGuilds = () => import(/* webpackChunkName: "guilds" */ 'client/components/groups/myGuilds');
const GuildsDiscoveryPage = () => import(/* webpackChunkName: "guilds" */ 'client/components/groups/discovery');
const GroupPage = () => import(/* webpackChunkName: "guilds" */ 'client/components/groups/group');
const GroupPlansAppPage = () => import(/* webpackChunkName: "guilds" */ 'client/components/groups/groupPlan');

// Group Plans
const GroupPlanIndex = () => import(/* webpackChunkName: "group-plans" */ 'client/components/group-plans/index');
const GroupPlanTaskInformation = () => import(/* webpackChunkName: "group-plans" */ 'client/components/group-plans/taskInformation');
const GroupPlanBilling = () => import(/* webpackChunkName: "group-plans" */ 'client/components/group-plans/billing');

// Challenges
const ChallengeIndex = () => import(/* webpackChunkName: "challenges" */ 'client/components/challenges/index');
const MyChallenges = () => import(/* webpackChunkName: "challenges" */ 'client/components/challenges/myChallenges');
const FindChallenges = () => import(/* webpackChunkName: "challenges" */ 'client/components/challenges/findChallenges');
const ChallengeDetail = () => import(/* webpackChunkName: "challenges" */ 'client/components/challenges/challengeDetail');

// Shops
const ShopsContainer = () => import(/* webpackChunkName: "shops" */'client/components/shops/index');
const MarketPage = () => import(/* webpackChunkName: "shops-market" */'client/components/shops/market/index');
const QuestsPage = () => import(/* webpackChunkName: "shops-quest" */'client/components/shops/quests/index');
const SeasonalPage = () => import(/* webpackChunkName: "shops-seasonal" */'client/components/shops/seasonal/index');
const TimeTravelersPage = () => import(/* webpackChunkName: "shops-timetravelers" */'client/components/shops/timeTravelers/index');

import NotFoundPage from 'client/components/404';

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
    { name: 'register', path: '/register', component: RegisterLoginReset, meta: {requiresLogin: false} },
    { name: 'login', path: '/login', component: RegisterLoginReset, meta: {requiresLogin: false} },
    { name: 'logout', path: '/logout', component: Logout },
    { name: 'resetPassword', path: '/reset-password', component: RegisterLoginReset, meta: {requiresLogin: false} },
    { name: 'tasks', path: '/', component: UserTasks },
    {
      name: 'userProfile',
      path: '/profile/:userId',
      component: ProfilePage,
      props: true,
      children: [
        { name: 'userProfilePage', path: ':startingPage', component: ProfilePage },
      ],
    },
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
        {
          name: 'groupPlanBilling',
          path: '/group-plans/:groupId/billing',
          component: GroupPlanBilling,
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
      component: StaticWrapper,
      children: [
        { name: 'app', path: 'app', component: AppPage, meta: {requiresLogin: false}},
        { name: 'clearBrowserData', path: 'clear-browser-data', component: ClearBrowserDataPage, meta: {requiresLogin: false}},
        { name: 'communityGuidelines', path: 'community-guidelines', component: CommunityGuidelinesPage, meta: {requiresLogin: false}},
        { name: 'contact', path: 'contact', component: ContactPage, meta: {requiresLogin: false}},
        { name: 'faq', path: 'faq', component: FAQPage, meta: {requiresLogin: false}},
        { name: 'features', path: 'features', component: FeaturesPage, meta: {requiresLogin: false}},
        { name: 'groupPlans', path: 'group-plans', component: GroupPlansPage, meta: {requiresLogin: false}},
        { name: 'home', path: 'home', component: HomePage, meta: {requiresLogin: false} },
        { name: 'front', path: 'front', component: HomePage, meta: {requiresLogin: false} },
        { name: 'merch', path: 'merch', component: MerchPage, meta: {requiresLogin: false}},
        { name: 'news', path: 'new-stuff', component: NewsPage, meta: {requiresLogin: false}},
        { name: 'overview', path: 'overview', component: OverviewPage, meta: {requiresLogin: false}},
        { name: 'plans', path: 'plans', component: GroupPlansPage, meta: {requiresLogin: false}},
        { name: 'pressKit', path: 'press-kit', component: PressKitPage, meta: {requiresLogin: false}},
        { name: 'privacy', path: 'privacy', component: PrivacyPage, meta: {requiresLogin: false}},
        { name: 'terms', path: 'terms', component: TermsPage, meta: {requiresLogin: false}},
        { name: 'notFound', path: 'not-found', component: NotFoundPage, meta: {requiresLogin: false} },
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
    // Only used to handle some redirects
    // See router.beforeEach
    { path: '/redirect/:redirect', name: 'redirect' },
    { path: '*', redirect: { name: 'notFound' } },
  ],
});

const store = getStore();

router.beforeEach(function routerGuard (to, from, next) {
  const isUserLoggedIn = store.state.isUserLoggedIn;
  const routeRequiresLogin = to.meta.requiresLogin !== false;

  if (to.name === 'redirect') return handleRedirect(to, from, next);

  if (!isUserLoggedIn && routeRequiresLogin) {
    // Redirect to the login page unless the user is trying to reach the
    // root of the website, in which case show the home page.
    // Pass the requested page as a query parameter to redirect later.

    const redirectTo = to.path === '/' ? 'home' : 'login';
    return next({
      name: redirectTo,
      query: redirectTo === 'login' ? {
        redirectTo: to.path,
      } : to.query,
    });
  }

  // Keep the redirectTo query param when going from login to register
  // !to.query.redirectTo is to avoid entering a loop of infinite redirects
  if (to.name === 'register' && !to.query.redirectTo && from.name === 'login' && from.query.redirectTo) {
    return next({
      name: 'register',
      query: {
        redirectTo: from.query.redirectTo,
      },
    });
  }

  if (isUserLoggedIn && (to.name === 'login' || to.name === 'register')) {
    return next({name: 'tasks'});
  }

  // Redirect old guild urls
  if (to.hash.indexOf('#/options/groups/guilds/') !== -1) {
    const splits = to.hash.split('/');
    const guildId = splits[4];

    return next({
      name: 'guild',
      params: {
        groupId: guildId,
      },
    });
  }

  // Redirect old challenge urls
  if (to.hash.indexOf('#/options/groups/challenges/') !== -1) {
    const splits = to.hash.split('/');
    const challengeId = splits[4];

    return next({
      name: 'challenge',
      params: {
        challengeId,
      },
    });
  }

  Analytics.track({
    hitType: 'pageview',
    eventCategory: 'navigation',
    eventAction: 'navigate',
    page: to.name || to.path,
  });

  if ((to.name === 'userProfile' || to.name === 'userProfilePage') && from.name !== null) {
    let startingPage = 'profile';
    if (to.params.startingPage !== undefined) {
      startingPage = to.params.startingPage;
    }
    router.app.$emit('habitica:show-profile', {
      userId: to.params.userId,
      startingPage,
      path: to.path,
    });
    return;
  }

  if ((to.name === 'stats' || to.name === 'achievements' || to.name === 'profile') && from.name !== null) {
    router.app.$emit('habitica:show-profile', {
      startingPage: to.name,
      path: to.path,
    });
    return;
  }

  if (from.name === 'userProfile' || from.name === 'userProfilePage' || from.name === 'stats' || from.name === 'achievements' || from.name === 'profile') {
    router.app.$root.$emit('bv::hide::modal', 'profile');
  }

  next();
});

export default router;
