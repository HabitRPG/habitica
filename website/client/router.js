import Vue from 'vue';
import VueRouter from 'vue-router';
import getStore from 'client/store';

import EmptyView from './components/emptyView';

// TODO Dummy elements used as placeholder until real components are implemented
import ParentPage from './components/parentPage';
import Page from './components/page';

// Static Pages
const Home = () => import(/* webpackChunkName: "static" */'./components/static/home');
const AppPage = () => import(/* webpackChunkName: "static" */'./components/static/app');
const ClearBrowserDataPage = () => import(/* webpackChunkName: "static" */'./components/static/clearBrowserData');
const CommunityGuidelinesPage = () => import(/* webpackChunkName: "static" */'./components/static/communityGuidelines');
const ContactPage = () => import(/* webpackChunkName: "static" */'./components/static/contact');
const FAQPage = () => import(/* webpackChunkName: "static" */'./components/static/faq');
const FeaturesPage = () => import(/* webpackChunkName: "static" */'./components/static/features');
const FrontPage = () => import(/* webpackChunkName: "static" */'./components/static/front');
const GroupPlansPage = () => import(/* webpackChunkName: "static" */'./components/static/groupPlans');
const MaintenancePage = () => import(/* webpackChunkName: "static" */'./components/static/maintenance');
const MaintenanceInfoPage = () => import(/* webpackChunkName: "static" */'./components/static/maintenanceInfo');
const MerchPage = () => import(/* webpackChunkName: "static" */'./components/static/merch');
// const NewStuffPage = () => import(/* webpackChunkName: "static" */'./components/static/newStuff');
const OverviewPage = () => import(/* webpackChunkName: "static" */'./components/static/overview');
const PressKitPage = () => import(/* webpackChunkName: "static" */'./components/static/pressKit');
const PrivacyPage = () => import(/* webpackChunkName: "static" */'./components/static/privacy');
const TermsPage = () => import(/* webpackChunkName: "static" */'./components/static/terms');
const VideosPage = () => import(/* webpackChunkName: "static" */'./components/static/videos');

const RegisterLogin = () => import(/* webpackChunkName: "auth" */'./components/auth/registerLogin');

// User Pages
const CreatorIntro = () => import(/* webpackChunkName: "creator" */'./components/creatorIntro');
const BackgroundsPage = () => import(/* webpackChunkName: "user" */'./components/userMenu/backgrounds');
const StatsPage = () => import(/* webpackChunkName: "user" */'./components/userMenu/stats');
const AchievementsPage = () => import(/* webpackChunkName: "user" */'./components/userMenu/achievements');
const ProfilePage = () => import(/* webpackChunkName: "user" */'./components/userMenu/profile');

// Settings
const Settings = () => import(/* webpackChunkName: "settings" */'./components/settings/index');
const API = () => import(/* webpackChunkName: "settings" */'./components/settings/api');
const DataExport = () => import(/* webpackChunkName: "settings" */'./components/settings/dataExport');
const Notifications = () => import(/* webpackChunkName: "settings" */'./components/settings/notifications');
const PromoCode = () => import(/* webpackChunkName: "settings" */'./components/settings/promoCode');
const Site = () => import(/* webpackChunkName: "settings" */'./components/settings/site');
const Subscription = () => import(/* webpackChunkName: "settings" */'./components/settings/subscription');

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

// Challenges
const ChallengeIndex = () => import(/* webpackChunkName: "challenges" */ './components/challenges/index');
const MyChallenges = () => import(/* webpackChunkName: "challenges" */ './components/challenges/myChallenges');
const FindChallenges = () => import(/* webpackChunkName: "challenges" */ './components/challenges/findChallenges');
const ChallengeDetail = () => import(/* webpackChunkName: "challenges" */ './components/challenges/challengeDetail');

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
          path: 'guild/:groupId',
          component: GuildPage,
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
          path: 'challenges/:challengeId',
          component: ChallengeDetail,
          props: true,
        },
      ],
    },
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
        { name: 'achievements', path: 'achievements', component: AchievementsPage },
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
        { name: 'app', path: 'app', component: AppPage },
        { name: 'clearBrowserData', path: 'clear-browser-data', component: ClearBrowserDataPage },
        { name: 'communitGuidelines', path: 'community-guidelines', component: CommunityGuidelinesPage },
        { name: 'contact', path: 'contact', component: ContactPage },
        { name: 'faq', path: 'faq', component: FAQPage },
        { name: 'features', path: 'features', component: FeaturesPage },
        { name: 'front', path: 'front', component: FrontPage },
        { name: 'groupPlans', path: 'group-plans', component: GroupPlansPage },
        { name: 'maintenance', path: 'maintenance', component: MaintenancePage },
        { name: 'maintenance-info', path: 'maintenance-info', component: MaintenanceInfoPage },
        { name: 'merch', path: 'merch', component: MerchPage },
        // { name: 'newStuff', path: 'newStuff', component: NewStuffPage },
        { name: 'overview', path: 'overview', component: OverviewPage },
        { name: 'plans', path: 'plans', component: GroupPlansPage },
        { name: 'pressKit', path: 'press-kit', component: PressKitPage },
        { name: 'privacy', path: 'privacy', component: PrivacyPage },
        { name: 'terms', path: 'terms', component: TermsPage },
        { name: 'videos', path: 'videos', component: VideosPage },
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
