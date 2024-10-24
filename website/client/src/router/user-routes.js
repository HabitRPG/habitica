import ParentPage from '@/components/parentPage.vue';

// Settings
const Settings = () => import(/* webpackChunkName: "settings" */'@/pages/settings-overview');
const GeneralSettings = () => import(/* webpackChunkName: "settings" */'@/pages/settings/generalSettings');
const Notifications = () => import(/* webpackChunkName: "settings" */'@/pages/settings/notificationSettings');
const Transactions = () => import(/* webpackChunkName: "settings" */'@/pages/settings/purchaseHistory.vue');

const SiteData = () => import(/* webpackChunkName: "settings" */'@/pages/settings/siteData.vue');

// not converted yet
const PromoCode = () => import(/* webpackChunkName: "settings" */'@/pages/settings/promoCode.vue');
const Subscription = () => import(/* webpackChunkName: "settings" */'@/components/settings/subscription');

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
          name: 'general',
          path: 'general',
          component: GeneralSettings,
        },
        {
          name: 'siteData',
          path: 'siteData',
          component: SiteData,
        },
        { path: 'api', redirect: { name: 'siteData' } },
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
