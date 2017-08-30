<template lang="pug">
#app(:class='{"casting-spell": castingSpell}')
  snackbars
  router-view(v-if="!isUserLoggedIn || isStaticPage")
  template(v-else)
    #loading-screen.h-100.w-100.d-flex.justify-content-center.align-items-center(v-if="!isUserLoaded")
      p Loading...
    template(v-else)
      notifications-display
      app-menu
      .container-fluid
        app-header
        buyModal(
          :item="selectedItemToBuy",
          :withPin="false",
          @change="resetItemToBuy($event)",
          @buyPressed="customPurchase($event)",
          :genericPurchase="genericPurchase(selectedItemToBuy)",

        )
        selectMembersModal(
          :item="selectedCardToBuy",
          :group="user.party",
          @change="resetCardToBuy($event)",
          @memberSelected="memberSelected($event)",
        )

        div(:class='{sticky: user.preferences.stickyHeader}')
          router-view
        app-footer
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
</style>

<style>
  .modal-backdrop.show {
    opacity: 1 !important;
    background-color: rgba(67, 40, 116, 0.9) !important;
  }
</style>

<script>
import axios from 'axios';
import AppMenu from './components/appMenu';
import AppHeader from './components/appHeader';
import AppFooter from './components/appFooter';
import notificationsDisplay from './components/notifications';
import snackbars from './components/snackbars/notifications';
import { mapState } from 'client/libs/store';
import BuyModal from './components/shops/buyModal.vue';
import SelectMembersModal from 'client/components/selectMembersModal.vue';
import notifications from 'client/mixins/notifications';

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
  },
  data () {
    return {
      isUserLoaded: false,
      selectedItemToBuy: null,
      selectedCardToBuy: null,
    };
  },
  computed: {
    ...mapState(['isUserLoggedIn']),
    ...mapState({user: 'user.data'}),
    isStaticPage () {
      return this.$route.meta.requiresLogin === false ? true : false;
    },
    castingSpell () {
      return this.$store.state.spellOptions.castingSpell;
    },
  },
  created () {
    this.$root.$on('buyModal::showItem', (item) => {
      this.selectedItemToBuy = item;
    });

    // Set up Error interceptors
    axios.interceptors.response.use((response) => {
      if (this.user) {
        this.$set(this.user, 'notifications', response.data.notifications);
      }
      return response;
    }, (error) => {
      if (error.response.status >= 400) {
        this.$store.state.notificationStore.push({
          title: 'Habitica',
          text: error.response.data.message,
          type: 'error',
          timeout: true,
        });
      }

      return Promise.reject(error);
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
        this.isUserLoaded = true;
      }).catch((err) => {
        console.error('Impossible to fetch user. Clean up localStorage and refresh.', err); // eslint-disable-line no-console
      });
    }
  },
  methods: {
    resetItemToBuy ($event) {
      if (!$event) {
        this.selectedItemToBuy = null;
      }
    },
    resetCardToBuy ($event) {
      if (!$event) {
        this.selectedCardToBuy = null;
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
          this.selectedCardToBuy = item;
        } else {
          this.error(this.$t('errorNotInParty'));
        }
      }
    },
    memberSelected (member) {
      this.$store.dispatch('user:castSpell', {key: this.selectedCardToBuy.key, targetId: member.id});
      this.selectedCardToBuy = null;
    },

  },
};
</script>

<style src="intro.js/minified/introjs.min.css"></style>
<style src="bootstrap/scss/bootstrap.scss" lang="scss"></style>
<style src="assets/scss/index.scss" lang="scss"></style>
<style src="assets/css/index.css"></style>
