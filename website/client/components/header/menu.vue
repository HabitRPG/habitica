<template lang="pug">
div
  inbox-modal
  creator-intro
  profile
  b-navbar.topbar.navbar-inverse.static-top.navbar-expand-lg(type="dark")
    .topbar-header.navbar-header
      .logo.svg-icon.d-none.d-xl-block(v-html="icons.logo")
      .svg-icon.gryphon.d-md-block.d-none.d-xl-none
      .svg-icon.gryphon.d-sm-block.d-lg-none.d-md-none
    b-nav-toggle(target='menu_collapse')
    b-collapse#menu_collapse.collapse.navbar-collapse
      .menu-list.ul.navbar-nav
        router-link.topbar-item.nav-item(tag="li", :to="{name: 'tasks'}", exact)
          a.topbar-link.nav-link(v-once) {{ $t('tasks') }}
        router-link.topbar-item.nav-item.dropdown(tag="li", :to="{name: 'items'}", :class="{'active': $route.path.startsWith('/inventory')}")
          a.topbar-link.nav-link(v-once) {{ $t('inventory') }}
          .dropdown-menu
            router-link.dropdown-item(:to="{name: 'items'}", exact) {{ $t('items') }}
            router-link.dropdown-item(:to="{name: 'equipment'}") {{ $t('equipment') }}
            router-link.dropdown-item(:to="{name: 'stable'}") {{ $t('stable') }}
        router-link.topbar-item.nav-item.dropdown(tag="li", :to="{name: 'market'}", :class="{'active': $route.path.startsWith('/shop')}")
          a.topbar-link.nav-link(v-once) {{ $t('shops') }}
          .dropdown-menu
            router-link.dropdown-item(:to="{name: 'market'}", exact) {{ $t('market') }}
            router-link.dropdown-item(:to="{name: 'quests'}") {{ $t('quests') }}
            router-link.dropdown-item(:to="{name: 'seasonal'}") {{ $t('titleSeasonalShop') }}
            router-link.dropdown-item(:to="{name: 'time'}") {{ $t('titleTimeTravelers') }}
        router-link.topbar-item.nav-item(tag="li", :to="{name: 'party'}", v-if='this.user.party._id')
          a.topbar-link.nav-link(v-once) {{ $t('party') }}
        .nav-item(@click='openPartyModal()', v-if='!this.user.party._id')
          a.topbar-link.nav-link(v-once) {{ $t('party') }}
        router-link.topbar-item.nav-item.dropdown(tag="li", :to="{name: 'tavern'}", :class="{'active': $route.path.startsWith('/guilds')}")
          a.nav-link(v-once) {{ $t('guilds') }}
          .dropdown-menu
            router-link.dropdown-item(:to="{name: 'tavern'}") {{ $t('tavern') }}
            router-link.dropdown-item(:to="{name: 'myGuilds'}") {{ $t('myGuilds') }}
            router-link.dropdown-item(:to="{name: 'guildsDiscovery'}") {{ $t('guildsDiscovery') }}
        router-link.topbar-item.nav-item.dropdown(tag="li", :to="{name: 'groupPlan'}", :class="{'active': $route.path.startsWith('/group-plans')}")
          a.topbar-link.nav-link(v-once) {{ $t('group') }}
          .dropdown-menu
            router-link.dropdown-item(v-for='group in groupPlans', :key='group._id', :to="{name: 'groupPlanDetailTaskInformation', params: {groupId: group._id}}") {{ group.name }}
        router-link.topbar-item.nav-item.dropdown(tag="li", :to="{name: 'myChallenges'}", :class="{'active': $route.path.startsWith('/challenges')}")
          a.topbar-link.nav-link(v-once) {{ $t('challenges') }}
          .dropdown-menu
            router-link.dropdown-item(:to="{name: 'myChallenges'}") {{ $t('myChallenges') }}
            router-link.dropdown-item(:to="{name: 'findChallenges'}") {{ $t('findChallenges') }}
        router-link.topbar-item.nav-item.dropdown(tag="li", :class="{'active': $route.path.startsWith('/help')}", :to="{name: 'faq'}")
          a.topbar-link.nav-link(v-once) {{ $t('help') }}
          .dropdown-menu
            router-link.dropdown-item(:to="{name: 'faq'}") {{ $t('faq') }}
            router-link.dropdown-item(:to="{name: 'overview'}") {{ $t('overview') }}
            router-link.dropdown-item(to="/groups/guild/a29da26b-37de-4a71-b0c6-48e72a900dac") {{ $t('reportBug') }}
            router-link.dropdown-item(to="/groups/guild/5481ccf3-5d2d-48a9-a871-70a7380cee5a") {{ $t('askAQuestion') }}
            a.dropdown-item(href="https://trello.com/c/odmhIqyW/440-read-first-table-of-contents", target='_blank') {{ $t('requestAF') }}
            a.dropdown-item(href="http://habitica.wikia.com/wiki/Contributing_to_Habitica", target='_blank') {{ $t('contributing') }}
            a.dropdown-item(href="http://habitica.wikia.com/wiki/Habitica_Wiki", target='_blank') {{ $t('wiki') }}
            a.dropdown-item(@click='modForm()') {{ $t('contactForm') }}
      .user-menu
        .item-with-icon(v-if="userHourglasses > 0")
          .top-menu-icon.svg-icon(v-html="icons.hourglasses", v-b-tooltip.hover.bottom="$t('mysticHourglassesTooltip')")
          span {{ userHourglasses }}
        .item-with-icon
          .top-menu-icon.svg-icon.gem(v-html="icons.gem", @click='showBuyGemsModal("gems")', v-b-tooltip.hover.bottom="$t('gems')")
          span {{userGems}}
        .item-with-icon.gold
          .top-menu-icon.svg-icon(v-html="icons.gold", v-b-tooltip.hover.bottom="$t('gold')")
          span {{Math.floor(user.stats.gp * 100) / 100}}
        a.item-with-icon(@click="sync", v-b-tooltip.hover.bottom="$t('sync')")
          .top-menu-icon.svg-icon(v-html="icons.sync")
        notification-menu.item-with-icon
        user-dropdown.item-with-icon
</template>

<style lang="scss" scoped>
  @import '~client/assets/scss/colors.scss';
  @import '~client/assets/scss/utils.scss';

  @media only screen and (max-width: 1305px) {
    .topbar-link {
      padding: .8em 1em !important;
    }

    .topbar-header {
      margin-right: 5px !important;
    }
  }

  @media only screen and (max-width: 1200px) {
    .gryphon {
      background-image: url('~assets/images/melior@3x.png');
      width: 30px;
      height: 30px;
      background-size: cover;
      color: $white;
      margin: 0 auto;

    }

    .svg-icon.gryphon.d-sm-block {
      position: absolute;
      left: calc(50% - 30px);
      top: 1em;
    }

    .topbar-item .topbar-link {
      font-size: 14px !important;
      padding: 16px 12px !important;
    }
  }

  @media only screen and (max-width: 990px) {
    #menu_collapse {
      margin-top: 0.6em;
      max-height: 320px;
      overflow: auto;
      flex-direction: column;
      background-color: $purple-100;

      .menu-list {
        width: 100%;
        order: 1;
      }

      .user-menu {
        margin: 10px;
        order: 0;
      }
    }
  }

  #menu_collapse {
    display: flex;
    justify-content: space-between;
  }

  .topbar {
    background: $purple-100 url(~assets/svg/for-css/bits.svg) right top no-repeat;
    padding-left: 25px;
    padding-right: 12.5px;
    min-height: 56px;
    box-shadow: 0 1px 2px 0 rgba($black, 0.24);
  }

  .navbar-z-index {
    &-normal {
      z-index: 1080;
    }

    &-modal {
      z-index: 1035;
    }
  }

  .topbar-header {
    margin-right: 48px;

    .logo {
      width: 128px;
      height: 28px;
    }
  }

  .user-menu {
    display: flex;
  }

  .topbar-item {
    .topbar-link {
      font-size: 16px;
      color: $white !important;
      font-weight: bold;
      line-height: 1.5;
      padding: 16px 20px;
      transition: none;
    }

    &:hover {
      .topbar-link {
        color: $white !important;
        background: $purple-200;
      }
    }

    &.active:not(:hover) {
      .topbar-link {
        box-shadow: 0px -4px 0px $purple-300 inset;
      }
    }
  }

  // Make the dropdown menu open on hover
  .dropdown:hover .dropdown-menu {
   display: block;
   margin-top: 0; // remove the gap so it doesn't close
  }

  .dropdown-menu {
    background: $purple-200;
    border-radius: 0px;
    border: none;
    box-shadow: none;
    padding: 0px;

    border-bottom-right-radius: 5px;
    border-bottom-left-radius: 5px;

    .dropdown-item {
      font-size: 16px;
      box-shadow: none;
      color: $white;
      border: none;
      line-height: 1.5;

      &.active {
        background: $purple-300;
      }

      &:hover {
        background: $purple-300;
        color: $white;

        &:last-child {
          border-bottom-right-radius: 5px;
          border-bottom-left-radius: 5px;
        }
      }
    }
  }

  .dropdown + .dropdown {
    margin-left: 0px;
  }

  .item-with-icon {
    color: $white;
    font-size: 16px;
    font-weight: normal;
    white-space: nowrap;

    span {
      font-weight: bold;
    }

    &.gold {
      margin-right: 24px;
    }

    &:hover /deep/ .top-menu-icon.svg-icon {
      color: $white;
    }

    & /deep/ .top-menu-icon.svg-icon {
      color: $header-color;
      vertical-align: bottom;
      display: inline-block;
      width: 24px;
      height: 24px;
      margin-right: 12px;
      margin-left: 12px;
    }
  }

  .menu-icon {
    margin-left: 24px;
  }

  .gem:hover {
    cursor: pointer;
  }

  .message-count {
    background-color: $blue-50;
    border-radius: 50%;
    height: 20px;
    width: 20px;
    float: right;
    color: $white;
    text-align: center;
    font-weight: bold;
    font-size: 12px;
  }

  .message-count.top-count {
    background-color: $red-50;
    position: absolute;
    right: 0;
    top: -0.5em;
    padding: .2em;
  }
</style>

<script>
import { mapState, mapGetters } from 'client/libs/store';
import * as Analytics from 'client/libs/analytics';
import { goToModForm } from 'client/libs/modform';

import gemIcon from 'assets/svg/gem.svg';
import goldIcon from 'assets/svg/gold.svg';
import syncIcon from 'assets/svg/sync.svg';
import svgHourglasses from 'assets/svg/hourglass.svg';
import logo from 'assets/svg/logo.svg';

import InboxModal from '../userMenu/inbox.vue';
import notificationMenu from './notificationsDropdown';
import creatorIntro from '../creatorIntro';
import profile from '../userMenu/profile';
import userDropdown from './userDropdown';

export default {
  components: {
    userDropdown,
    InboxModal,
    notificationMenu,
    creatorIntro,
    profile,
  },
  data () {
    return {
      isUserDropdownOpen: false,
      icons: Object.freeze({
        gem: gemIcon,
        gold: goldIcon,
        hourglasses: svgHourglasses,
        sync: syncIcon,
        logo,
      }),
    };
  },
  computed: {
    ...mapGetters({
      userGems: 'user:gems',
    }),
    ...mapState({
      user: 'user.data',
      userHourglasses: 'user.data.purchased.plan.consecutive.trinkets',
      groupPlans: 'groupPlans',
      modalStack: 'modalStack',
    }),
    navbarZIndexClass () {
      if (this.modalStack.length > 0) {
        return 'navbar-z-index-modal';
      }
      return 'navbar-z-index-normal';
    },
  },
  mounted () {
    this.getUserGroupPlans();
  },
  methods: {
    modForm () {
      goToModForm(this.user);
    },
    toggleUserDropdown () {
      this.isUserDropdownOpen = !this.isUserDropdownOpen;
    },
    sync () {
      this.$root.$emit('habitica::resync-requested');
      return Promise.all([
        this.$store.dispatch('user:fetch', {forceLoad: true}),
        this.$store.dispatch('tasks:fetchUserTasks', {forceLoad: true}),
      ]);
    },
    async getUserGroupPlans () {
      this.$store.state.groupPlans = await this.$store.dispatch('guilds:getGroupPlans');
    },
    openPartyModal () {
      this.$root.$emit('bv::show::modal', 'create-party-modal');
    },
    showBuyGemsModal (startingPage) {
      this.$store.state.gemModalOptions.startingPage = startingPage;

      Analytics.track({
        hitType: 'event',
        eventCategory: 'button',
        eventAction: 'click',
        eventLabel: 'Gems > Toolbar',
      });

      this.$root.$emit('bv::show::modal', 'buy-gems', {alreadyTracked: true});
    },
  },
};
</script>
