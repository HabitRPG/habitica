import ParentPage from '@/components/parentPage.vue';

// Settings
const Settings = () => import(/* webpackChunkName: "settings" */'@/components/settings/index');
const API = () => import(/* webpackChunkName: "settings" */'@/components/settings/api');
const DataExport = () => import(/* webpackChunkName: "settings" */'@/components/settings/dataExport');
const Notifications = () => import(/* webpackChunkName: "settings" */'@/components/settings/notifications');
const PromoCode = () => import(/* webpackChunkName: "settings" */'@/components/settings/promoCode');
const Site = () => import(/* webpackChunkName: "settings" */'@/components/settings/site');
const Subscription = () => import(/* webpackChunkName: "settings" */'@/components/settings/subscription');
const Transactions = () => import(/* webpackChunkName: "settings" */'@/components/settings/purchaseHistory');

export const USER_ROUTES = {
  path: '/user',
  component: ParentPage,
  children: [
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
};
