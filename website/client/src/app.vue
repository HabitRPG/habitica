<template>
  <div>
    <div
      v-if="loading"
      id="loading-screen-inapp"
    >
      <div class="row">
        <div class="col-12 text-center">
          <!-- eslint-disable max-len -->
          <svg
            id="melior"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 61.91 64"
          >
            <path
              d="M61.82,64H51.59c-3.08,0-3.72.37-3.67-1,0.07-1.87.67-1.94,2.63-2.49,1.63-.45,1-3.35-0.8-5.88-1.28-1.76-3.89-3.81-7.31-2.22a10.75,10.75,0,0,0-4.56,3.52c-1.68,2.33-1.59,4.54,1,4.54s5.39-1.5,6.23.64c1,2.64.33,2.89-.18,2.89H28.55v0C19.77,64,11,63.93,9,58.38c-2.82-7.68,7.43-10.64,7.75-15.46,0.13-2-1-2.85-2.34-2.85h-6V36.41H4.7v-11H8.36V29.1H12v3.65h3.65v5.08a5.76,5.76,0,0,1,3.07,5.05c-0.17,5.51-9.5,8.57-7.79,14.35,1.56,5.29,13.37,4,13,.74L23.7,56.1c-0.06-2.62-.47-6.12.08-9.22C24.64,42,27.67,37.78,33,37.74c1,0,1.78-.21,1.78-1s-1.55-.84-2.64-0.95a23.35,23.35,0,0,1-12.56-5c-2.43-2-6.21-8.3-3.74-7.83a21.74,21.74,0,0,0,4.06.4c1.24,0,4.44-.35,4.44-1.11,0-1-1.85-.42-4.57-0.68C16.48,21.22,9.6,19.83,6,9.35,4.71,5.43,3.83-1.91,6,.46c12.46,13.7,16.69,11.47,23.84,16.16,3.15,2.06,5.19,7,7,6.58,1.2-.27.46-1.37,0.64-3.93C37.66,17,38.75,16.48,36,15.79c-3.26-.81-6.52-4.38-4.39-4.33a11.89,11.89,0,0,0,5.53-.76c1.87-.81,6.43-4.28,9.18-2.89s5.08-.6,6.94-0.25c2.71,0.51,3.41,4.24,3.05,6.42-0.22,1.38-.22,1.38-2,1.28-3.61-.21-4.53,2.67-2,4.25,3.87,2.42,5.51,4.23,6.56,9.58,0.51,2.6.1,3.2-.76,2.72s-2.34-.72-0.29,4-1.29,10.28-2.39,10.9a1.3,1.3,0,0,0-.91,1.34c0,11.42,0,12.27,1.92,12.48,2.9,0.31,4.14-1.44,5.27.06C63.29,62.73,63.41,64,61.82,64ZM4.7,21.28H1v3.65H4.7V21.28Z"
              transform="translate(-1.05)"
              fill="#fff"
            ></path>
          </svg>
          <!-- eslint-enable max-len -->
        </div>
      </div>
    </div>
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
      <snackbars />
      <router-view v-if="!isUserLoggedIn || isStaticPage" />
      <template v-else>
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
            :class="{'no-margin': noMargin}"
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
      </template>
    </div>
  </div>
</template>

<style lang='scss' scoped>
  @import '~@/assets/scss/colors.scss';

  #app {
    display: flex;
    flex-direction: column;
    overflow-x: hidden;
  }

  #loading-screen-inapp {
    #melior {
      margin: 0 auto;
      width: 70.9px;
    }

    .row {
      width: 100%;
    }

    h2 {
      color: $white;
      font-size: 32px;
      font-weight: bold;
    }

    p {
      margin: 0 auto;
      width: 448px;
      font-size: 24px;
      color: #d5c8ff;
    }
  }

  .casting-spell {
    cursor: crosshair;
  }

  .container-fluid {
    flex: 1 0 auto;
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
import AppMenu from './components/header/menu';
import AppHeader from './components/header/index';
import ChatBanner from './components/header/banners/chatBanner';
import DamagePausedBanner from './components/header/banners/damagePaused';
import GemsPromoBanner from './components/header/banners/gemsPromo';
import GiftPromoBanner from './components/header/banners/giftPromo';
import BirthdayBanner from './components/header/banners/birthdayBanner';
import AppFooter from './components/appFooter';
import notificationsDisplay from './components/notifications';
import snackbars from './components/snackbars/notifications';
import { mapState } from '@/libs/store';
import * as Analytics from '@/libs/analytics';
import BuyModal from './components/shops/buyModal.vue';
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
    snackbars,
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
    ...mapState(['isUserLoggedIn', 'browserTimezoneUtcOffset', 'isUserLoaded', 'notificationsRemoved']),
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

      const file = `/static/audio/${theme}/${sound}`;

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

    // @TODO: I'm not sure these should be at the app level.
    // Can we move these back into shop/inventory or maybe they need a lateral move?
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

    axios.interceptors.response.use(response => { // Set up Response interceptors
      // Verify that the user was not updated from another browser/app/client
      // If it was, sync
      const { url } = response.config;
      const { method } = response.config;

      const isApiCall = url.indexOf('api/v4') !== -1;
      const userV = response.data && response.data.userV;

      if (this.isUserLoaded && isApiCall && userV) {
        const oldUserV = this.user._v;
        this.user._v = userV;

        // Do not sync again if already syncing
        const isUserSync = url.indexOf('/api/v4/user') === 0 && method === 'get';
        const isTasksSync = url.indexOf('/api/v4/tasks/user') === 0 && method === 'get';
        // exclude chat seen requests because with real time chat they would be too many
        const isChatSeen = url.indexOf('/chat/seen') !== -1 && method === 'post';
        // exclude POST /api/v4/cron because the user is synced automatically after cron runs
        const isCron = url.indexOf('/api/v4/cron') === 0 && method === 'post';
        // exclude skills casting as they already return the synced user
        const isCast = url.indexOf('/api/v4/user/class/cast') !== -1 && method === 'post';

        // Something has changed on the user object that was not tracked here, sync the user
        if (
          userV - oldUserV > 1 && !isCron && !isChatSeen && !isUserSync && !isTasksSync && !isCast
        ) {
          Promise.all([
            this.$store.dispatch('user:fetch', { forceLoad: true }),
            this.$store.dispatch('tasks:fetchUserTasks', { forceLoad: true }),
          ]);
        }
      }

      // Store the app version from the server
      const serverAppVersion = response.data && response.data.appVersion;

      if (serverAppVersion && this.$store.state.serverAppVersion !== response.data.appVersion) {
        this.$store.state.serverAppVersion = serverAppVersion;
      }

      // Store the notifications, filtering those that have already been read
      // See store/index.js on why this is necessary
      if (this.user && response.data && response.data.notifications) {
        const filteredNotifications = response.data.notifications.filter(serverNotification => {
          if (this.notificationsRemoved.includes(serverNotification.id)) return false;
          return true;
        });
        this.$set(this.user, 'notifications', filteredNotifications);
      }

      return response;
    }, error => { // Set up Error interceptors
      if (error.response.status >= 400) {
        const isBanned = this.checkForBannedUser(error);
        if (isBanned === true) return null; // eslint-disable-line consistent-return

        // Don't show errors from getting user details. These users have delete their account,
        // but their chat message still exists.
        const configExists = Boolean(error.response) && Boolean(error.response.config);
        if (configExists && error.response.config.method === 'get' && error.response.config.url.indexOf('/api/v4/members/') !== -1) {
          // @TODO: We resolve the promise because we need our caching to cache this user as tried
          // Chat paging should help this, but maybe we can also find another solution..
          return Promise.resolve(error);
        }

        const errorData = error.response.data;
        const errorMessage = errorData.message || errorData;

        // Check for conditions to reset the user auth
        // TODO use a specific error like NotificationNotFound instead of checking for the string
        const invalidUserMessage = [this.$t('invalidCredentials'), 'Missing authentication headers.'];
        if (invalidUserMessage.indexOf(errorMessage) !== -1) {
          this.$store.dispatch('auth:logout', { redirectToLogin: true });
          return null;
        }

        // Most server errors should return is click to dismiss errors, with some exceptions
        let snackbarTimeout = false;
        if (error.response.status === 502) snackbarTimeout = true;

        const errorsToShow = [];
        // show only the first error for each param
        const paramErrorsFound = {};
        if (errorData.errors) {
          for (const e of errorData.errors) {
            if (!paramErrorsFound[e.param]) {
              errorsToShow.push(e.message);
              paramErrorsFound[e.param] = true;
            }
          }
        } else {
          errorsToShow.push(errorMessage);
        }

        // Ignore NotificationNotFound errors, see https://github.com/HabitRPG/habitica/issues/10391
        if (errorData.error !== 'NotificationNotFound') {
          // dispatch as one snackbar notification
          this.$store.dispatch('snackbars:add', {
            title: 'Habitica',
            text: errorsToShow.join(' '),
            type: 'error',
            timeout: snackbarTimeout,
          });
        }
      }

      return Promise.reject(error);
    });

    // Setup listener for title
    this.$store.watch(state => state.title, title => {
      document.title = title;
    });
    this.$nextTick(() => {
      // Load external scripts after the app has been rendered
      Analytics.load();
    });

    if (this.isUserLoggedIn && !this.isStaticPage) {
      // Load the user and the user tasks
      Promise.all([
        this.$store.dispatch('user:fetch'),
        this.$store.dispatch('tasks:fetchUserTasks'),
      ]).then(() => {
        this.$store.state.isUserLoaded = true;
        Analytics.setUser();
        Analytics.updateUser();
        return axios.get('/api/v4/i18n/browser-script',
          {
            language: this.user.preferences.language,
            headers: {
              'Cache-Control': 'no-cache',
              Pragma: 'no-cache',
              Expires: '0',
            },
          });
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
    } else {
      this.hideLoadingScreen();
    }
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
<style src="@/assets/scss/index.scss" lang="scss"></style>
<style src="@/assets/scss/sprites.scss" lang="scss"></style>
<style src="smartbanner.js/dist/smartbanner.min.css"></style>
