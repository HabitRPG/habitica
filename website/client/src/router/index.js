import Vue from 'vue';
import VueRouter from 'vue-router';
import * as Analytics from '@/libs/analytics';
import getStore from '@/store';
import handleRedirect from './handleRedirect';

import ParentPage from '@/components/parentPage';
import { PAGES } from '@/libs/consts';

// NOTE: when adding a page make sure to implement the `common:setTitle` action

// Static Pages
const StaticWrapper = () => import(/* webpackChunkName: "entry" */'@/components/static/staticWrapper');
const HomePage = () => import(/* webpackChunkName: "entry" */'@/components/static/home');

const AppPage = () => import(/* webpackChunkName: "static" */'@/components/static/app');
const AppleRedirectPage = () => import(/* webpackChunkName: "static" */'@/components/static/appleRedirect');
const ClearBrowserDataPage = () => import(/* webpackChunkName: "static" */'@/components/static/clearBrowserData');
const CommunityGuidelinesPage = () => import(/* webpackChunkName: "static" */'@/components/static/communityGuidelines');
const ContactPage = () => import(/* webpackChunkName: "static" */'@/components/static/contact');
const FAQPage = () => import(/* webpackChunkName: "static" */'@/components/static/faq');
const FeaturesPage = () => import(/* webpackChunkName: "static" */'@/components/static/features');
const GroupPlansPage = () => import(/* webpackChunkName: "static" */'@/components/static/groupPlans');
// Commenting out merch page see
// https://github.com/HabitRPG/habitica/issues/12039
// const MerchPage = () => import(/* webpackChunkName: "static" */'@/components/static/merch');
const NewsPage = () => import(/* webpackChunkName: "static" */'@/components/static/newStuff');
const OverviewPage = () => import(/* webpackChunkName: "static" */'@/components/static/overview');
const PressKitPage = () => import(/* webpackChunkName: "static" */'@/components/static/pressKit');
const PrivacyPage = () => import(/* webpackChunkName: "static" */'@/components/static/privacy');
const ChatSunsetFaq = () => import(/* webpackChunkName: "static" */'@/components/static/chatSunsetFaq');
const TermsPage = () => import(/* webpackChunkName: "static" */'@/components/static/terms');

const RegisterLoginReset = () => import(/* webpackChunkName: "auth" */'@/components/auth/registerLoginReset');
const Logout = () => import(/* webpackChunkName: "auth" */'@/components/auth/logout');

// User Pages
// const StatsPage = () => import(/* webpackChunkName: "user" */'./components/userMenu/stats');
// const AchievementsPage =
// () => import(/* webpackChunkName: "user" */'./components/userMenu/achievements');
const ProfilePage = () => import(/* webpackChunkName: "user" */'@/components/userMenu/profilePage');

// Settings
const Settings = () => import(/* webpackChunkName: "settings" */'@/components/settings/index');
const API = () => import(/* webpackChunkName: "settings" */'@/components/settings/api');
const DataExport = () => import(/* webpackChunkName: "settings" */'@/components/settings/dataExport');
const Notifications = () => import(/* webpackChunkName: "settings" */'@/components/settings/notifications');
const PromoCode = () => import(/* webpackChunkName: "settings" */'@/components/settings/promoCode');
const Site = () => import(/* webpackChunkName: "settings" */'@/components/settings/site');
const Subscription = () => import(/* webpackChunkName: "settings" */'@/components/settings/subscription');
const Transactions = () => import(/* webpackChunkName: "settings" */'@/components/settings/purchaseHistory');

// Hall
const HallPage = () => import(/* webpackChunkName: "hall" */'@/components/hall/index');
const PatronsPage = () => import(/* webpackChunkName: "hall" */'@/components/hall/patrons');
const HeroesPage = () => import(/* webpackChunkName: "hall" */'@/components/hall/heroes');

// Admin Panel
const AdminPanelPage = () => import(/* webpackChunkName: "admin-panel" */'@/components/admin-panel');
const AdminPanelUserPage = () => import(/* webpackChunkName: "admin-panel" */'@/components/admin-panel/user-support');

// Except for tasks that are always loaded all the other main level
// All the main level
// components are loaded in separate webpack chunks.
// See https://webpack.js.org/guides/code-splitting-async/
// for docs

// Tasks
const UserTasks = () => import(/* webpackChunkName: "userTasks" */'@/components/tasks/user');

// Inventory
const InventoryContainer = () => import(/* webpackChunkName: "inventory" */'@/components/inventory/index');
const ItemsPage = () => import(/* webpackChunkName: "inventory" */'@/components/inventory/items/index');
const EquipmentPage = () => import(/* webpackChunkName: "inventory" */'@/components/inventory/equipment/index');
const StablePage = () => import(/* webpackChunkName: "inventory" */'@/components/inventory/stable/index');

// Guilds & Parties
const GroupPage = () => import(/* webpackChunkName: "guilds" */ '@/components/groups/group');
const GroupPlansAppPage = () => import(/* webpackChunkName: "guilds" */ '@/components/groups/groupPlan');
const LookingForParty = () => import(/* webpackChunkName: "guilds" */ '@/components/groups/lookingForParty');

// Group Plans
const GroupPlanIndex = () => import(/* webpackChunkName: "group-plans" */ '@/components/group-plans/index');
const GroupPlanTaskInformation = () => import(/* webpackChunkName: "group-plans" */ '@/components/group-plans/taskInformation');
const GroupPlanBilling = () => import(/* webpackChunkName: "group-plans" */ '@/components/group-plans/billing');

const MessagesIndex = () => import(/* webpackChunkName: "private-messages" */ '@/pages/private-messages');

// Challenges
const ChallengeIndex = () => import(/* webpackChunkName: "challenges" */ '@/components/challenges/index');
const MyChallenges = () => import(/* webpackChunkName: "challenges" */ '@/components/challenges/myChallenges');
const FindChallenges = () => import(/* webpackChunkName: "challenges" */ '@/components/challenges/findChallenges');
const ChallengeDetail = () => import(/* webpackChunkName: "challenges" */ '@/components/challenges/challengeDetail');

// Shops
const ShopsContainer = () => import(/* webpackChunkName: "shops" */'@/components/shops/index');
const MarketPage = () => import(/* webpackChunkName: "shops-market" */'@/components/shops/market/index');
const QuestsPage = () => import(/* webpackChunkName: "shops-quest" */'@/components/shops/quests/index');
const SeasonalPage = () => import(/* webpackChunkName: "shops-seasonal" */'@/components/shops/seasonal/index');
const TimeTravelersPage = () => import(/* webpackChunkName: "shops-timetravelers" */'@/components/shops/timeTravelers/index');

const NotFoundPage = () => import(/* webpackChunkName: "not-found" */'@/components/404');

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
  // meta defaults: requiresLogin true, privilegeNeeded empty
  // NOTE: when adding a new route entry make sure to implement the `common:setTitle` action
  // in the route component to set a specific subtitle for the page.
  routes: [
    {
      name: 'register', path: '/register', component: RegisterLoginReset, meta: { requiresLogin: false },
    },
    {
      name: 'login', path: '/login', component: RegisterLoginReset, meta: { requiresLogin: false },
    },
    { name: 'logout', path: '/logout', component: Logout },
    {
      name: 'resetPassword', path: '/reset-password', component: RegisterLoginReset, meta: { requiresLogin: false },
    },
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
    { name: 'lookingForParty', path: '/looking-for-party', component: LookingForParty },
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
      component: NotFoundPage,
      children: [
        { name: 'tavern', path: 'tavern' },
        {
          name: 'myGuilds',
          path: 'myGuilds',
        },
        {
          name: 'guildsDiscovery',
          path: 'discovery',
        },
        {
          name: 'guild',
          path: 'guild/:groupId',
          props: true,
        },
      ],
    },
    { path: PAGES.PRIVATE_MESSAGES, name: 'privateMessages', component: MessagesIndex },
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
              name: 'transactions',
              path: 'transactions',
              component: Transactions,
              meta: {
                privilegeNeeded: [
                  'userSupport',
                ],
              },
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
        {
          name: 'app', path: 'app', component: AppPage, meta: { requiresLogin: false },
        },
        {
          name: 'appleRedirect', path: 'apple-redirect', component: AppleRedirectPage, meta: { requiresLogin: false },
        },
        {
          name: 'clearBrowserData', path: 'clear-browser-data', component: ClearBrowserDataPage, meta: { requiresLogin: false },
        },
        {
          name: 'communityGuidelines', path: 'community-guidelines', component: CommunityGuidelinesPage, meta: { requiresLogin: false },
        },
        {
          name: 'contact', path: 'contact', component: ContactPage, meta: { requiresLogin: false },
        },
        {
          name: 'faq', path: 'faq', component: FAQPage, meta: { requiresLogin: false },
        },
        {
          name: 'chatSunsetFaq', path: 'faq/tavern-and-guilds', component: ChatSunsetFaq, meta: { requiresLogin: false },
        },
        {
          name: 'features', path: 'features', component: FeaturesPage, meta: { requiresLogin: false },
        },
        {
          name: 'groupPlans', path: 'group-plans', component: GroupPlansPage, meta: { requiresLogin: false },
        },
        {
          name: 'home', path: 'home', component: HomePage, meta: { requiresLogin: false },
        },
        {
          name: 'front', path: 'front', component: HomePage, meta: { requiresLogin: false },
        },
        {
          name: 'news', path: 'new-stuff', component: NewsPage, meta: { requiresLogin: false },
        },
        {
          name: 'overview', path: 'overview', component: OverviewPage, meta: { requiresLogin: false },
        },
        {
          name: 'plans', path: 'plans', component: GroupPlansPage, meta: { requiresLogin: false },
        },
        {
          name: 'pressKit', path: 'press-kit', component: PressKitPage, meta: { requiresLogin: false },
        },
        {
          name: 'privacy', path: 'privacy', component: PrivacyPage, meta: { requiresLogin: false },
        },
        {
          name: 'terms', path: 'terms', component: TermsPage, meta: { requiresLogin: false },
        },
        {
          name: 'notFound', path: 'not-found', component: NotFoundPage, meta: { requiresLogin: false },
        },
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

    {
      name: 'adminPanel',
      path: '/admin-panel',
      component: AdminPanelPage,
      meta: {
        privilegeNeeded: [ // any one of these is enough to give access
          'userSupport',
          'newsPoster',
        ],
      },
      children: [
        {
          name: 'adminPanelUser',
          path: ':userIdentifier', // User ID or Username
          component: AdminPanelUserPage,
          meta: {
            privilegeNeeded: [
              'userSupport',
            ],
          },
        },
      ],
    },

    // Only used to handle some redirects
    // See router.beforeEach
    { path: '/redirect/:redirect', name: 'redirect' },
    { path: '*', redirect: { name: 'notFound' } },
  ],
});

const store = getStore();

router.beforeEach(async (to, from, next) => {
  const { isUserLoggedIn, isUserLoaded } = store.state;
  const routeRequiresLogin = to.meta.requiresLogin !== false;
  const routePrivilegeNeeded = to.meta.privilegeNeeded;

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
    return next({ name: 'tasks' });
  }

  if (routePrivilegeNeeded) {
    // Redirect non-admin users when trying to access a page.
    if (!isUserLoaded) await store.dispatch('user:fetch');
    if (!store.state.user.data.permissions.fullAccess) {
      const userHasPriv = routePrivilegeNeeded.some(
        privName => store.state.user.data.permissions[privName],
      );
      if (!userHasPriv) return next({ name: 'tasks' });
    }
  }

  if (to.name === 'party') {
    router.app.$root.$emit('update-party');
  }

  if (to.name === 'lookingForParty') {
    Analytics.track({
      hitType: 'event',
      eventName: 'View Find Members',
      eventAction: 'View Find Members',
      eventCategory: 'behavior',
    }, { trackOnClient: true });
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

    return null;
  }

  if (to.name === 'tasks' && to.query.openGemsModal === 'true') {
    setTimeout(() => router.app.$emit('bv::show::modal', 'buy-gems'), 500);
    return next({ name: 'tasks' });
  }

  if ((to.name === 'stats' || to.name === 'achievements' || to.name === 'profile') && from.name !== null) {
    router.app.$emit('habitica:show-profile', {
      startingPage: to.name,
      path: to.path,
    });
    return null;
  }

  if (from.name === 'userProfile' || from.name === 'userProfilePage' || from.name === 'stats' || from.name === 'achievements' || from.name === 'profile') {
    router.app.$root.$emit('bv::hide::modal', 'profile');
  }

  return next();
});

router.afterEach((to, from) => {
  if (from.name === 'chatSunsetFaq') {
    document.body.style.background = '#f9f9f9';
  }
});

export default router;
