// NOTE: when adding a page make sure to implement the `common:setTitle` action

import { NotFoundPage } from './shared-route-imports';

const StaticWrapper = () => import('@/components/static/staticWrapper');
const HomePage = () => import('@/components/static/home');

const AppleRedirectPage = () => import('@/components/static/appleRedirect');
const ChatSunsetFaq = () => import('@/components/static/chatSunsetFaq');
const ClearBrowserDataPage = () => import('@/components/static/clearBrowserData');
const CommunityGuidelinesPage = () => import('@/components/static/communityGuidelines');
const ContentScheduleFaq = () => import('@/components/static/contentScheduleFaq');
const ContactPage = () => import('@/components/static/contact');
const FAQPage = () => import('@/components/static/faq');
const FeaturesPage = () => import('@/components/static/features');
const GroupPlansPage = () => import('@/components/static/groupPlans');
// Commenting out merch page see
// https://github.com/HabitRPG/habitica/issues/12039
// const MerchPage = () => import('@/components/static/merch');
const NewsPage = () => import('@/components/static/newStuff');
const OverviewPage = () => import('@/components/static/overview');
const PressKitPage = () => import('@/components/static/pressKit');
const PrivacyPage = () => import('@/components/static/privacy');
const RegisterLoginReset = () => import(/* webpackChunkName: "auth" */'@/components/auth/registerLoginReset');
const RegisterUsername = () => import(/* webpackChunkName: "auth" */'@/components/auth/registerUsername');
const SubscriptionBenefitsFaq = () => import('@/components/static/subscriptionBenefitsFaq');
const TermsPage = () => import('@/components/static/terms');

export const STATIC_ROUTES = {
  path: '/static',
  component: StaticWrapper,
  children: [
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
      name: 'contentScheduleFaq', path: 'faq/content-release-changes', component: ContentScheduleFaq, meta: { requiresLogin: false },
    },
    {
      name: 'subscriptionBenefitsFaq', path: 'faq/subscription-benefits-adjustments', component: SubscriptionBenefitsFaq, meta: { requiresLogin: false },
    },
    {
      name: 'features', path: 'features', component: FeaturesPage, meta: { requiresLogin: false },
    },
    {
      name: 'front', path: 'front', component: HomePage, meta: { requiresLogin: false },
    },
    {
      name: 'groupPlans', path: 'group-plans', component: GroupPlansPage, meta: { requiresLogin: false },
    },
    {
      name: 'home', path: 'home', component: HomePage, meta: { requiresLogin: false },
    },
    {
      name: 'login', path: '/login', component: RegisterLoginReset, meta: { requiresLogin: false },
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
      name: 'privacyReview', path: 'privacy-review', component: PrivacyPage, meta: { requiresLogin: false },
    },
    {
      name: 'register', path: '/register', component: RegisterLoginReset, meta: { requiresLogin: false },
    },
    {
      name: 'terms', path: 'terms', component: TermsPage, meta: { requiresLogin: false },
    },
    {
      name: 'termsReview', path: 'terms-review', component: TermsPage, meta: { requiresLogin: false },
    },
    {
      name: 'username', path: '/username', component: RegisterUsername, meta: { requiresLogin: false },
    },
    {
      name: 'notFound', path: 'not-found', component: NotFoundPage, meta: { requiresLogin: false },
    },
  ],
};
