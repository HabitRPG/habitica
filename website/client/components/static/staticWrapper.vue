<template lang='pug'>
  div
    static-header

    app-page(v-if='$route.name === "app"')
    clear-browser-data(v-if='$route.name === "clearBrowserData"')
    community-guidelines(v-if='$route.name === "communityGuidelines"')
    contact-page(v-if='$route.name === "contact"')
    faq-page(v-if='$route.name === "faq"')
    features-page(v-if='$route.name === "features"')
    group-plans(v-if='$route.name === "groupPlans"')
    home-page(v-if='$route.name === "home"')
    merch-page(v-if='$route.name === "merch"')
    overview-page(v-if='$route.name === "overview"')
    press-kit(v-if='$route.name === "pressKit"')
    privacy-page(v-if='$route.name === "privacy"')
    terms-of-use(v-if='$route.name === "terms"')

    app-footer
</template>

<style lang='scss'>
  @import '~client/assets/scss/colors.scss';

  .container-fluid {
    margin: 5em 2em 2em 2em;
  }

  h1, h2 {
    margin-top: 0.5em;
    color: $purple-200;
  }

  h3, h4 {
    color: $purple-200;
  }

  li, p {
    font-size: 16px;
  }

  .media img {
    margin: 1em;
  }

  .strong {
    font-weight: bold;
  }
</style>

<script>
  import AppFooter from 'client/components/appFooter';
  import StaticHeader from './header.vue';

  import AppPage from './app.vue';
  import ClearBrowserData from './clearBrowserData.vue';
  import CommunityGuidelines from './communityGuidelines.vue';
  import ContactPage from './contact.vue';
  import FaqPage from './faq.vue';
  import FeaturesPage from './features.vue';
  import GroupPlans from './groupPlans.vue';
  import HomePage from './home.vue';
  import MerchPage from './merch.vue';
  import OverviewPage from './overview.vue';
  import PressKit from './pressKit.vue';
  import PrivacyPage from './privacy.vue';
  import TermsOfUse from './terms.vue';

  export default {
    components: {
      AppFooter,
      AppPage,
      ClearBrowserData,
      CommunityGuidelines,
      ContactPage,
      FaqPage,
      FeaturesPage,
      GroupPlans,
      HomePage,
      MerchPage,
      OverviewPage,
      PressKit,
      PrivacyPage,
      StaticHeader,
      TermsOfUse,
    },
  };
</script>
