import ParentPage from '@/components/parentPage';


// User Pages
// const StatsPage = () => import(/* webpackChunkName: "user" */'./components/userMenu/stats');
// const AchievementsPage =
// () => import(/* webpackChunkName: "user" */'./components/userMenu/achievements');
export const ProfilePage = () => import(/* webpackChunkName: "user" */'@/components/userMenu/profilePage');

// Settings
const Settings = () => import(/* webpackChunkName: "settings" */'@/pages/settings-overview');
const GeneralSettings = () => import(/* webpackChunkName: "settings" */'@/pages/settings/generalSettings');
const Notifications = () => import(/* webpackChunkName: "settings" */'@/pages/settings/notificationSettings');

// not converted yet
const API = () => import(/* webpackChunkName: "settings" */'@/components/settings/api');
const DataExport = () => import(/* webpackChunkName: "settings" */'@/components/settings/dataExport');
const PromoCode = () => import(/* webpackChunkName: "settings" */'@/components/settings/promoCode');
const Site = () => import(/* webpackChunkName: "settings" */'@/components/settings/site');
const Subscription = () => import(/* webpackChunkName: "settings" */'@/components/settings/subscription');
const Transactions = () => import(/* webpackChunkName: "settings" */'@/components/settings/purchaseHistory');


export const USER_ROUTES = {
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
          name: 'general',
          path: 'general',
          component: GeneralSettings,
        },
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
        },
        {
          name: 'notifications',
          path: 'notifications',
          component: Notifications,
        },
      ],
    },
  ],
};
