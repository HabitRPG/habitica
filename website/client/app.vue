<template lang="pug">
div
  #loading-screen-inapp(v-if='loading')
    .row
      .col-12.text-center
        svg#melior(xmlns='http://www.w3.org/2000/svg', viewbox='0 0 61.91 64')
          path(d='M61.82,64H51.59c-3.08,0-3.72.37-3.67-1,0.07-1.87.67-1.94,2.63-2.49,1.63-.45,1-3.35-0.8-5.88-1.28-1.76-3.89-3.81-7.31-2.22a10.75,10.75,0,0,0-4.56,3.52c-1.68,2.33-1.59,4.54,1,4.54s5.39-1.5,6.23.64c1,2.64.33,2.89-.18,2.89H28.55v0C19.77,64,11,63.93,9,58.38c-2.82-7.68,7.43-10.64,7.75-15.46,0.13-2-1-2.85-2.34-2.85h-6V36.41H4.7v-11H8.36V29.1H12v3.65h3.65v5.08a5.76,5.76,0,0,1,3.07,5.05c-0.17,5.51-9.5,8.57-7.79,14.35,1.56,5.29,13.37,4,13,.74L23.7,56.1c-0.06-2.62-.47-6.12.08-9.22C24.64,42,27.67,37.78,33,37.74c1,0,1.78-.21,1.78-1s-1.55-.84-2.64-0.95a23.35,23.35,0,0,1-12.56-5c-2.43-2-6.21-8.3-3.74-7.83a21.74,21.74,0,0,0,4.06.4c1.24,0,4.44-.35,4.44-1.11,0-1-1.85-.42-4.57-0.68C16.48,21.22,9.6,19.83,6,9.35,4.71,5.43,3.83-1.91,6,.46c12.46,13.7,16.69,11.47,23.84,16.16,3.15,2.06,5.19,7,7,6.58,1.2-.27.46-1.37,0.64-3.93C37.66,17,38.75,16.48,36,15.79c-3.26-.81-6.52-4.38-4.39-4.33a11.89,11.89,0,0,0,5.53-.76c1.87-.81,6.43-4.28,9.18-2.89s5.08-.6,6.94-0.25c2.71,0.51,3.41,4.24,3.05,6.42-0.22,1.38-.22,1.38-2,1.28-3.61-.21-4.53,2.67-2,4.25,3.87,2.42,5.51,4.23,6.56,9.58,0.51,2.6.1,3.2-.76,2.72s-2.34-.72-0.29,4-1.29,10.28-2.39,10.9a1.3,1.3,0,0,0-.91,1.34c0,11.42,0,12.27,1.92,12.48,2.9,0.31,4.14-1.44,5.27.06C63.29,62.73,63.41,64,61.82,64ZM4.7,21.28H1v3.65H4.7V21.28Z', transform='translate(-1.05)', fill='#fff')
      .col-12.text-center
        h2 {{$t('tipTitle', {tipNumber: currentTipNumber})}}
        p {{currentTip}}
  #app(:class='{"casting-spell": castingSpell}')
    amazon-payments-modal
    snackbars
    router-view(v-if="!isUserLoggedIn || isStaticPage")
    template(v-else)
        template(v-if="isUserLoaded")
          notifications-display
          app-menu
          .container-fluid
            app-header
            buyModal(
              :item="selectedItemToBuy || {}",
              :withPin="true",
              @change="resetItemToBuy($event)",
              @buyPressed="customPurchase($event)",
              :genericPurchase="genericPurchase(selectedItemToBuy)",

            )
            selectMembersModal(
              :item="selectedSpellToBuy || {}",
              :group="user.party",
              @memberSelected="memberSelected($event)",
            )

            div(:class='{sticky: user.preferences.stickyHeader}')
              router-view
            app-footer

            audio#sound(autoplay, ref="sound")
              source#oggSource(type="audio/ogg", :src="sound.oggSource")
              source#mp3Source(type="audio/mp3", :src="sound.mp3Source")
</template>

<style lang='scss' scoped>
  #loading-screen-inapp {
    #melior {
      margin: 0 auto;
      width: 70.9px;
      margin-bottom: 1em;
    }

    .row {
      width: 100%;
    }

    h2 {
      color: #fff;
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

  .notification {
    border-radius: 1000px;
    background-color: #24cc8f;
    box-shadow: 0 2px 2px 0 rgba(26, 24, 29, 0.16), 0 1px 4px 0 rgba(26, 24, 29, 0.12);
    padding: .5em 1em;
    color: #fff;
    margin-top: .5em;
    margin-bottom: .5em;
  }

  .container-fluid {
    overflow-x: hidden;
  }

  #app {
    height: calc(100% - 56px); /* 56px is the menu */
  }
</style>

<style>
  /* @TODO: The modal-open class is not being removed. Let's try this for now */
  .modal, .modal-open {
    overflow-y: scroll !important;
  }

  .modal-backdrop.show {
    opacity: 1 !important;
    background-color: rgba(67, 40, 116, 0.9) !important;
  }

  /* Push progress bar above modals */
  #nprogress .bar {
    z-index: 1041;
  }
</style>

<script>
import axios from 'axios';
import { loadProgressBar } from 'axios-progress-bar';

import AppMenu from './components/header/menu';
import AppHeader from './components/header/index';
import AppFooter from './components/appFooter';
import notificationsDisplay from './components/notifications';
import snackbars from './components/snackbars/notifications';
import { mapState } from 'client/libs/store';
import * as Analytics from 'client/libs/analytics';
import BuyModal from './components/shops/buyModal.vue';
import SelectMembersModal from 'client/components/selectMembersModal.vue';
import notifications from 'client/mixins/notifications';
import { setup as setupPayments } from 'client/libs/payments';
import amazonPaymentsModal from 'client/components/payments/amazonModal';

export default {
  mixins: [notifications],
  name: 'app',
  components: {
    AppMenu,
    AppHeader,
    AppFooter,
    notificationsDisplay,
    snackbars,
    BuyModal,
    SelectMembersModal,
    amazonPaymentsModal,
  },
  data () {
    return {
      selectedItemToBuy: null,
      selectedSpellToBuy: null,

      sound: {
        oggSource: '',
        mp3Source: '',
      },
      loading: true,
      currentTipNumber: 0,
    };
  },
  computed: {
    ...mapState(['isUserLoggedIn', 'browserTimezoneOffset', 'isUserLoaded']),
    ...mapState({user: 'user.data'}),
    isStaticPage () {
      return this.$route.meta.requiresLogin === false ? true : false;
    },
    castingSpell () {
      return this.$store.state.spellOptions.castingSpell;
    },
    currentTip () {
      const numberOfTips = 35 + 1;
      const min = 1;
      const randomNumber = Math.random() * (numberOfTips - min) + min;
      const tipNumber = Math.floor(randomNumber);
      this.currentTipNumber = tipNumber;

      return this.$t(`tip${tipNumber}`);
    },
  },
  created () {
    this.$root.$on('playSound', (sound) => {
      let theme = this.user.preferences.sound;

      if (!theme || theme === 'off')
        return;

      let file =  `/static/audio/${theme}/${sound}`;
      this.sound = {
        oggSource: `${file}.ogg`,
        mp3Source: `${file}.mp3`,
      };

      this.$refs.sound.load();
    });

    // @TODO: I'm not sure these should be at the app level. Can we move these back into shop/inventory or maybe they need a lateral move?
    this.$root.$on('buyModal::showItem', (item) => {
      this.selectedItemToBuy = item;
      this.$root.$emit('bv::show::modal', 'buy-modal');
    });

    this.$root.$on('selectMembersModal::showItem', (item) => {
      this.selectedSpellToBuy = item;
      this.$root.$emit('bv::show::modal', 'select-member-modal');
    });

    // @TODO split up this file, it's too big

    loadProgressBar({
      showSpinner: false,
    });

    // Set up Error interceptors
    axios.interceptors.response.use((response) => {
      if (this.user && response.data && response.data.notifications) {
        this.$set(this.user, 'notifications', response.data.notifications);
      }
      return response;
    }, (error) => {
      if (error.response.status >= 400) {
        // Check for conditions to reset the user auth
        const invalidUserMessage = [this.$t('invalidCredentials'), 'Missing authentication headers.'];
        if (invalidUserMessage.indexOf(error.response.data) !== -1) {
          this.$store.dispatch('auth:logout');
        }

        // Don't show errors from getting user details. These users have delete their account,
        // but their chat message still exists.
        let configExists = Boolean(error.response) && Boolean(error.response.config);
        if (configExists && error.response.config.method === 'get' && error.response.config.url.indexOf('/api/v3/members/') !== -1) {
          // @TODO: We resolve the promise because we need our caching to cache this user as tried
          // Chat paging should help this, but maybe we can also find another solution..
          return Promise.resolve(error);
        }

        this.$store.dispatch('snackbars:add', {
          title: 'Habitica',
          text: error.response.data,
          type: 'error',
          timeout: true,
        });
      }

      return Promise.reject(error);
    });

    axios.interceptors.response.use((response) => {
      // Verify that the user was not updated from another browser/app/client
      // If it was, sync
      const url = response.config.url;
      const method = response.config.method;

      const isApiCall = url.indexOf('api/v3') !== -1;
      const userV = response.data && response.data.userV;
      const isCron = url.indexOf('/api/v3/cron') === 0 && method === 'post';

      if (this.isUserLoaded && isApiCall && userV) {
        const oldUserV = this.user._v;
        this.user._v = userV;

        // Do not sync again if already syncing
        const isUserSync = url.indexOf('/api/v3/user') === 0 && method === 'get';
        const isTasksSync = url.indexOf('/api/v3/tasks/user') === 0 && method === 'get';
        // exclude chat seen requests because with real time chat they would be too many
        const isChatSeen = url.indexOf('/chat/seen') !== -1  && method === 'post';
        // exclude POST /api/v3/cron because the user is synced automatically after cron runs

        // Something has changed on the user object that was not tracked here, sync the user
        if (userV - oldUserV > 1 && !isCron && !isChatSeen && !isUserSync && !isTasksSync) {
          Promise.all([
            this.$store.dispatch('user:fetch', {forceLoad: true}),
            this.$store.dispatch('tasks:fetchUserTasks', {forceLoad: true}),
          ]);
        }
      }

      // Verify the client is updated
      // const serverAppVersion = response.data.appVersion;
      // let serverAppVersionState = this.$store.state.serverAppVersion;
      // if (isApiCall && !serverAppVersionState) {
      //   this.$store.state.serverAppVersion = serverAppVersion;
      // } else if (isApiCall && serverAppVersionState !== serverAppVersion) {
      //   if (document.activeElement.tagName !== 'INPUT' || confirm(this.$t('habiticaHasUpdated'))) {
      //     location.reload(true);
      //   }
      // }

      return response;
    });

    // Setup listener for title
    this.$store.watch(state => state.title, (title) => {
      document.title = title;
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

        this.hideLoadingScreen();

        // Adjust the timezone offset
        if (this.user.preferences.timezoneOffset !== this.browserTimezoneOffset) {
          this.$store.dispatch('user:set', {
            'preferences.timezoneOffset': this.browserTimezoneOffset,
          });
        }

        this.$nextTick(() => {
          // Load external scripts after the app has been rendered
          setupPayments();
          Analytics.load();
        });
      }).catch((err) => {
        console.error('Impossible to fetch user. Clean up localStorage and refresh.', err); // eslint-disable-line no-console
      });
    } else {
      this.hideLoadingScreen();
    }

    // Manage modals
    this.$root.$on('bv::show::modal', (modalId, data = {}) => {
      if (data.fromRoot) return;

      // Track opening of gems modal unless it's been already tracked
      // For example the gems button in the menu already tracks the event by itself
      if (modalId === 'buy-gems' && data.alreadyTracked !== true) {
        Analytics.track({
          hitType: 'event',
          eventCategory: 'button',
          eventAction: 'click',
          eventLabel: 'Gems > Wallet',
        });
      }

      // Get last modal on stack and hide
      let modalStackLength = this.$store.state.modalStack.length;
      let modalOnTop = this.$store.state.modalStack[modalStackLength - 1];

      // Add new modal to the stack
      this.$store.state.modalStack.push(modalId);

      // Hide the previous top modal
      if (modalOnTop) this.$root.$emit('bv::hide::modal', modalOnTop, {fromRoot: true});
    });

    // @TODO: This part is hacky and could be solved with two options:
    // 1 - Find a way to pass fromRoot to hidden
    // 2 - Enforce that all modals use the hide::modal event
    this.$root.$on('bv::modal::hidden', (bvEvent) => {
      const modalId = bvEvent.target.id;

      let modalStackLength = this.$store.state.modalStack.length;
      let modalSecondToTop = this.$store.state.modalStack[modalStackLength - 2];
      // Don't remove modal if hid was called from main app
      // @TODO: I'd reather use this, but I don't know how to pass data to hidden event
      // if (data && data.fromRoot) return;
      if (modalId === modalSecondToTop) return;

      // Remove modal from stack
      this.$store.state.modalStack.pop();

      // Recalculate and show the last modal if there is one
      modalStackLength = this.$store.state.modalStack.length;
      let modalOnTop = this.$store.state.modalStack[modalStackLength - 1];
      if (modalOnTop) this.$root.$emit('bv::show::modal', modalOnTop, {fromRoot: true});
    });
  },
  mounted () {
    // Remove the index.html loading screen and now show the inapp loading
    const loadingScreen = document.getElementById('loading-screen');
    if (loadingScreen) document.body.removeChild(loadingScreen);
  },
  methods: {
    resetItemToBuy ($event) {
      // @TODO: Do we need this? I think selecting a new item
      // overwrites. @negue might know
      if (!$event && this.selectedItemToBuy.purchaseType !== 'card') {
        this.selectedItemToBuy = null;
      }
    },
    itemSelected (item) {
      this.selectedItemToBuy = item;
    },
    genericPurchase (item) {
      if (!item)
        return false;

      if (item.purchaseType === 'card')
        return false;

      return true;
    },
    customPurchase (item) {
      if (item.purchaseType === 'card') {
        this.selectedSpellToBuy = item;

        this.$root.$emit('bv::hide::modal', 'buy-modal');
        this.$root.$emit('bv::show::modal', 'select-member-modal');
      }
    },
    async memberSelected (member) {
      let castResult = await this.$store.dispatch('user:castSpell', {key: this.selectedSpellToBuy.key, targetId: member.id});

      // Subtract gold for cards
      if (this.selectedSpellToBuy.pinType === 'card') {
        const newUserGp = castResult.data.data.user.stats.gp;
        this.$store.state.user.data.stats.gp = newUserGp;
      }

      this.selectedSpellToBuy = null;

      if (this.user.party._id) {
        this.$store.dispatch('party:getMembers', {forceLoad: true});
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
<style src="assets/scss/index.scss" lang="scss"></style>
<style src="assets/css/sprites/spritesmith-largeSprites-0.css"></style>
<style src="assets/css/sprites/spritesmith-main-0.css"></style>
<style src="assets/css/sprites/spritesmith-main-1.css"></style>
<style src="assets/css/sprites/spritesmith-main-2.css"></style>
<style src="assets/css/sprites/spritesmith-main-3.css"></style>
<style src="assets/css/sprites/spritesmith-main-4.css"></style>
<style src="assets/css/sprites/spritesmith-main-5.css"></style>
<style src="assets/css/sprites/spritesmith-main-6.css"></style>
<style src="assets/css/sprites/spritesmith-main-7.css"></style>
<style src="assets/css/sprites/spritesmith-main-8.css"></style>
<style src="assets/css/sprites/spritesmith-main-9.css"></style>
<style src="assets/css/sprites/spritesmith-main-10.css"></style>
<style src="assets/css/sprites/spritesmith-main-11.css"></style>
<style src="assets/css/sprites/spritesmith-main-12.css"></style>
<style src="assets/css/sprites/spritesmith-main-13.css"></style>
<style src="assets/css/sprites/spritesmith-main-14.css"></style>
<style src="assets/css/sprites/spritesmith-main-15.css"></style>
<style src="assets/css/sprites/spritesmith-main-16.css"></style>
<style src="assets/css/sprites/spritesmith-main-17.css"></style>
<style src="assets/css/sprites/spritesmith-main-18.css"></style>
<style src="assets/css/sprites/spritesmith-main-19.css"></style>
<style src="assets/css/sprites/spritesmith-main-20.css"></style>
<style src="assets/css/sprites.css"></style>
