<template lang="pug">
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

<style scoped>
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
        if (invalidUserMessage.indexOf(error.response.data.message) !== -1) {
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
          text: error.response.data.message,
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
      let modalOnTop = this.$store.state.modalStack[modalStackLength - 1];
      let modalSecondToTop = this.$store.state.modalStack[modalStackLength - 2];
      // Don't remove modal if hid was called from main app
      // @TODO: I'd reather use this, but I don't know how to pass data to hidden event
      // if (data && data.fromRoot) return;
      if (modalId === modalSecondToTop) return;

      // Remove modal from stack
      this.$store.state.modalStack.pop();

      // Recalculate and show the last modal if there is one
      modalStackLength = this.$store.state.modalStack.length;
      modalOnTop = this.$store.state.modalStack[modalStackLength - 1];
      if (modalOnTop) this.$root.$emit('bv::show::modal', modalOnTop, {fromRoot: true});
    });
  },
  methods: {
    resetItemToBuy ($event) {
      if (!$event) {
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
        if (this.user.party._id) {
          this.selectedSpellToBuy = item;

          this.$root.$emit('bv::hide::modal', 'buy-modal');
          this.$root.$emit('bv::show::modal', 'select-member-modal');
        } else {
          this.error(this.$t('errorNotInParty'));
        }
      }
    },
    async memberSelected (member) {
      this.$store.dispatch('user:castSpell', {key: this.selectedSpellToBuy.key, targetId: member.id});
      this.selectedSpellToBuy = null;

      this.$store.dispatch('party:getMembers', {forceLoad: true});

      this.$root.$emit('bv::hide::modal', 'select-member-modal');
    },
    hideLoadingScreen () {
      const loadingScreen = document.getElementById('loading-screen');
      if (loadingScreen) document.body.removeChild(loadingScreen);
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
