<template>
  <div
    id="app"
    :class="{
      'casting-spell': castingSpell,
    }"
  >
    <!-- <banned-account-modal /> -->
    <amazon-payments-modal v-if="!isStaticPage" />
    <payments-success-modal />
    <sub-cancel-modal-confirm v-if="isUserLoaded" />
    <sub-canceled-modal v-if="isUserLoaded" />
    <bug-report-modal v-if="isUserLoaded" />
    <bug-report-success-modal v-if="isUserLoaded" />
    <external-link-modal />
    <birthday-modal />
    <template v-if="isUserLoaded">
      <chat-banner />
      <damage-paused-banner />
      <gems-promo-banner />
      <gift-promo-banner />
      <birthday-banner />
      <notifications-display />
      <app-menu />
      <div
        class="container-fluid"
        :class="{'no-margin': noMargin, 'groups-background': $route.fullPath === '/group-plans' }"
      >
        <app-header />
        <buyModal
          :item="selectedItemToBuy || {}"
          :with-pin="true"
          :generic-purchase="genericPurchase(selectedItemToBuy)"
          @buyPressed="customPurchase($event)"
        />
        <selectMembersModal
          :item="selectedSpellToBuy || {}"
          :group="user.party"
          @memberSelected="memberSelected($event)"
        />
        <div :class="{sticky: user.preferences.stickyHeader}">
          <router-view />
        </div>
      </div>
      <app-footer v-if="!hideFooter" />
      <audio
        id="sound"
        ref="sound"
        autoplay="autoplay"
      ></audio>
    </template>
  </div>
</template>

  <style lang='scss' scoped>
    @import '~@/assets/scss/colors.scss';

    #app {
      display: flex;
      flex-direction: column;
      overflow-x: hidden;
    }

    .casting-spell {
      cursor: crosshair;
    }

    .container-fluid {
      flex: 1 0 auto;

      &.groups-background {
        background-color: white;
        background-image: url('../assets/images/group-plans-static/top.svg');
        background-repeat: no-repeat;
      }
    }

    .no-margin {
      margin-left: 0;
      margin-right: 0;
      padding-left: 0;
      padding-right: 0;
    }

    .notification {
      border-radius: 1000px;
      background-color: $green-10;
      box-shadow: 0 2px 2px 0 rgba(26, 24, 29, 0.16), 0 1px 4px 0 rgba(26, 24, 29, 0.12);
      padding: .5em 1em;
      color: $white;
      margin-top: .5em;
      margin-bottom: .5em;
    }
  </style>

  <style lang='scss'>
    @import '~@/assets/scss/colors.scss';

    .modal-backdrop {
      opacity: .9 !important;
      background-color: $purple-100 !important;
    }

    /* Push progress bar above modals */
    #nprogress .bar {
      z-index: 1600 !important; /* Must stay above nav bar */
    }
  </style>

<script>
import axios from 'axios';
import { loadProgressBar } from 'axios-progress-bar';

import birthdayModal from '@/components/news/birthdayModal';
import AppMenu from '@/components/header/menu';
import AppHeader from '@/components/header/index';
import ChatBanner from '@/components/header/banners/chatBanner';
import DamagePausedBanner from '@/components/header/banners/damagePaused';
import GemsPromoBanner from '@/components/header/banners/gemsPromo';
import GiftPromoBanner from '@/components/header/banners/giftPromo';
import BirthdayBanner from '@/components/header/banners/birthdayBanner';
import AppFooter from '@/components/appFooter';
import notificationsDisplay from '@/components/notifications';
import { mapState } from '@/libs/store';
import * as Analytics from '@/libs/analytics';
import BuyModal from '@/components/shops/buyModal.vue';
import SelectMembersModal from '@/components/selectMembersModal.vue';
import notifications from '@/mixins/notifications';
import { setup as setupPayments } from '@/libs/payments';
import amazonPaymentsModal from '@/components/payments/amazonModal';
import paymentsSuccessModal from '@/components/payments/successModal';
import subCancelModalConfirm from '@/components/payments/cancelModalConfirm';
import subCanceledModal from '@/components/payments/canceledModal';
import externalLinkModal from '@/components/externalLinkModal.vue';

import spellsMixin from '@/mixins/spells';
import {
  CONSTANTS,
  getLocalSetting,
  removeLocalSetting,
} from '@/libs/userlocalManager';

const bugReportModal = () => import(/* webpackChunkName: "bug-report-modal" */'@/components/bugReportModal');
const bugReportSuccessModal = () => import(/* webpackChunkName: "bug-report-success-modal" */'@/components/bugReportSuccessModal');

  const COMMUNITY_MANAGER_EMAIL = process.env.EMAILS_COMMUNITY_MANAGER_EMAIL; // eslint-disable-line

export default {
  name: 'App',
  components: {
    AppMenu,
    AppHeader,
    AppFooter,
    birthdayModal,
    ChatBanner,
    DamagePausedBanner,
    GemsPromoBanner,
    GiftPromoBanner,
    BirthdayBanner,
    notificationsDisplay,
    BuyModal,
    SelectMembersModal,
    amazonPaymentsModal,
    paymentsSuccessModal,
    subCancelModalConfirm,
    subCanceledModal,
    bugReportModal,
    bugReportSuccessModal,
    externalLinkModal,
  },
  mixins: [notifications, spellsMixin],
  data () {
    return {
      selectedItemToBuy: null,
      selectedSpellToBuy: null,

      audioSource: null,
      audioSuffix: null,

      loading: true,
      bannerHidden: false,
    };
  },
  computed: {
    ...mapState(['isUserLoggedIn', 'browserTimezoneUtcOffset', 'isUserLoaded']),
    ...mapState({ user: 'user.data' }),
    isStaticPage () {
      return this.$route.meta.requiresLogin === false;
    },
    castingSpell () {
      return this.$store.state.spellOptions.castingSpell;
    },
    noMargin () {
      return ['privateMessages'].includes(this.$route.name);
    },
    hideFooter () {
      return ['privateMessages'].includes(this.$route.name);
    },
  },
  created () {
    this.$root.$on('playSound', sound => {
      const theme = this.user.preferences.sound;

      if (!theme || theme === 'off') {
        return;
      }

      const file = `https://habitica-assets.s3.amazonaws.com/mobileApp/sounds/${theme}/${sound}`;

      if (this.audioSuffix === null) {
        this.audioSource = document.createElement('source');
        if (this.$refs.sound.canPlayType('audio/ogg')) {
          this.audioSuffix = '.ogg';
          this.audioSource.type = 'audio/ogg';
        } else {
          this.audioSuffix = '.mp3';
          this.audioSource.type = 'audio/mp3';
        }
        this.audioSource.src = file + this.audioSuffix;
        this.$refs.sound.appendChild(this.audioSource);
      } else {
        this.audioSource.src = file + this.audioSuffix;
      }

      this.$refs.sound.load();
    });

    this.$root.$on('buyModal::showItem', item => {
      this.selectedItemToBuy = item;
      this.$root.$emit('bv::show::modal', 'buy-modal');
    });

    this.$root.$on('bv::modal::hidden', event => {
      if (event.componentId === 'buy-modal') {
        this.$root.$emit('buyModal::hidden', this.selectedItemToBuy.key);
      }
    });

    this.$root.$on('selectMembersModal::showItem', item => {
      this.selectedSpellToBuy = item;
      this.$root.$emit('bv::show::modal', 'select-member-modal');
    });

    // @TODO split up this file, it's too big

    loadProgressBar({
      showSpinner: false,
    });

    // Setup listener for title
    this.$store.watch(state => state.title, title => {
      document.title = title;
    });

    // Load the user and the user tasks
    Promise.all([
      this.$store.dispatch('user:fetch'),
      this.$store.dispatch('tasks:fetchUserTasks'),
    ]).then(() => {
      this.$store.state.isUserLoaded = true;
      Analytics.setUser();
      Analytics.updateUser();
      if (window && window['habitica-i18n']) {
        if (this.user.preferences.language === window['habitica-i18n'].language.code) {
          return null;
        }
      }
      if (window && window['habitica-i18n']) {
        if (this.user.preferences.language === window['habitica-i18n'].language.code) {
          return null;
        }
      }
      return axios.get(
        '/api/v4/i18n/browser-script',
        {
          language: this.user.preferences.language,
          headers: {
            'Cache-Control': 'no-cache',
            Pragma: 'no-cache',
            Expires: '0',
          },
        },
      );
    }).then(() => {
      const i18nData = window && window['habitica-i18n'];
      this.$loadLocale(i18nData);
      this.hideLoadingScreen();

      // Adjust the timezone offset
      const browserTimezoneOffset = -this.browserTimezoneUtcOffset;
      if (this.user.preferences.timezoneOffset !== browserTimezoneOffset) {
        this.$store.dispatch('user:set', {
          'preferences.timezoneOffset': browserTimezoneOffset,
        });
      }

      let appState = getLocalSetting(CONSTANTS.savedAppStateValues.SAVED_APP_STATE);
      if (appState) {
        appState = JSON.parse(appState);
        if (appState.paymentCompleted) {
          removeLocalSetting(CONSTANTS.savedAppStateValues.SAVED_APP_STATE);
          this.$root.$emit('habitica:payment-success', appState);
        }
      }
      this.$nextTick(() => {
        // Load external scripts after the app has been rendered
        setupPayments();
      });
    }).catch(err => {
      console.error('Impossible to fetch user. Clean up localStorage and refresh.', err); // eslint-disable-line no-console
    });
  },
  beforeDestroy () {
    this.$root.$off('playSound');
    this.$root.$off('buyModal::showItem');
    this.$root.$off('selectMembersModal::showItem');
  },
  mounted () {
    // Remove the index.html loading screen and now show the inapp loading
    const loadingScreen = document.getElementById('loading-screen');
    if (loadingScreen) document.body.removeChild(loadingScreen);
  },
  methods: {
    checkForBannedUser (error) {
      const AUTH_SETTINGS = localStorage.getItem('habit-mobile-settings');
      const parseSettings = JSON.parse(AUTH_SETTINGS);
      const errorMessage = error.response.data.message;

      // Case where user is not logged in
      if (!parseSettings) {
        return false;
      }

      const bannedMessage = this.$t('accountSuspended', {
        communityManagerEmail: COMMUNITY_MANAGER_EMAIL,
        userId: parseSettings.auth.apiId,
      });

      if (errorMessage !== bannedMessage) return false;

      this.$store.dispatch('auth:logout', { redirectToLogin: true });
      return true;
    },
    itemSelected (item) {
      this.selectedItemToBuy = item;
    },
    genericPurchase (item) {
      if (!item) return false;

      if (['card', 'debuffPotion'].includes(item.purchaseType)) return false;

      return true;
    },
    customPurchase (item) {
      if (item.purchaseType === 'card') {
        this.selectedSpellToBuy = item;

        // hide the dialog
        this.$root.$emit('bv::hide::modal', 'buy-modal');
        // remove the dialog from our modal-stack,
        // the default hidden event is delayed
        this.$root.$emit('bv::modal::hidden', {
          target: {
            id: 'buy-modal',
          },
        });

        this.$root.$emit('bv::show::modal', 'select-member-modal');
      }

      if (item.purchaseType === 'debuffPotion') {
        this.castStart(item, this.user);
      }
    },
    async memberSelected (member) {
      await this.castStart(this.selectedSpellToBuy, member);

      this.selectedSpellToBuy = null;

      if (this.user.party._id) {
        this.$store.dispatch('party:getMembers', { forceLoad: true });
      }

      this.$root.$emit('bv::hide::modal', 'select-member-modal');
    },
    hideLoadingScreen () {
      this.loading = false;
    },
  },
};
</script>

  <style src="intro.js/minified/introjs.min.css"></style>
  <style src="axios-progress-bar/dist/nprogress.css"></style>
