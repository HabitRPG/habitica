<template lang="pug">
div
  inbox-modal
  creator-intro
  profile
  nav.navbar.navbar-inverse.fixed-top.navbar-toggleable-lg
    .navbar-header
      .logo.svg-icon(v-html="icons.logo")
    b-collapse#nav_collapse.collapse.navbar-collapse(is-nav)
      ul.navbar-nav.mr-auto
        router-link.nav-item(tag="li", :to="{name: 'tasks'}", exact)
          a.nav-link(v-once) {{ $t('tasks') }}
        router-link.nav-item.dropdown(tag="li", :to="{name: 'items'}", :class="{'active': $route.path.startsWith('/inventory')}")
          a.nav-link(v-once) {{ $t('inventory') }}
          .dropdown-menu
            router-link.dropdown-item(:to="{name: 'items'}", exact) {{ $t('items') }}
            router-link.dropdown-item(:to="{name: 'equipment'}") {{ $t('equipment') }}
            router-link.dropdown-item(:to="{name: 'stable'}") {{ $t('stable') }}
        router-link.nav-item.dropdown(tag="li", :to="{name: 'market'}", :class="{'active': $route.path.startsWith('/shop')}")
          a.nav-link(v-once) {{ $t('shops') }}
          .dropdown-menu
            router-link.dropdown-item(:to="{name: 'market'}", exact) {{ $t('market') }}
            router-link.dropdown-item(:to="{name: 'quests'}") {{ $t('quests') }}
            router-link.dropdown-item(:to="{name: 'seasonal'}") {{ $t('titleSeasonalShop') }}
            router-link.dropdown-item(:to="{name: 'time'}") {{ $t('titleTimeTravelers') }}
        router-link.nav-item(tag="li", :to="{name: 'party'}", v-if='this.user.party._id')
          a.nav-link(v-once) {{ $t('party') }}
        .nav-item(@click='openPartyModal()', v-if='!this.user.party._id')
          a.nav-link(v-once) {{ $t('party') }}
        router-link.nav-item.dropdown(tag="li", :to="{name: 'tavern'}", :class="{'active': $route.path.startsWith('/guilds')}")
          a.nav-link(v-once) {{ $t('guilds') }}
          .dropdown-menu
            router-link.dropdown-item(:to="{name: 'tavern'}") {{ $t('tavern') }}
            router-link.dropdown-item(:to="{name: 'myGuilds'}") {{ $t('myGuilds') }}
            router-link.dropdown-item(:to="{name: 'guildsDiscovery'}") {{ $t('guildsDiscovery') }}
        router-link.nav-item.dropdown(tag="li", :to="{name: 'groupPlan'}", :class="{'active': $route.path.startsWith('/group-plans')}")
          a.nav-link(v-once) {{ $t('group') }}
          .dropdown-menu
            router-link.dropdown-item(v-for='group in groupPlans', :key='group._id', :to="{name: 'groupPlanDetailTaskInformation', params: {groupId: group._id}}") {{ group.name }}
        router-link.nav-item.dropdown(tag="li", :to="{name: 'myChallenges'}", :class="{'active': $route.path.startsWith('/challenges')}")
          a.nav-link(v-once) {{ $t('challenges') }}
          .dropdown-menu
            router-link.dropdown-item(:to="{name: 'myChallenges'}") {{ $t('myChallenges') }}
            router-link.dropdown-item(:to="{name: 'findChallenges'}") {{ $t('findChallenges') }}
        router-link.nav-item.dropdown(tag="li", to="/help", :class="{'active': $route.path.startsWith('/help')}", :to="{name: 'faq'}")
          a.nav-link(v-once) {{ $t('help') }}
          .dropdown-menu
            router-link.dropdown-item(:to="{name: 'faq'}") {{ $t('faq') }}
            router-link.dropdown-item(:to="{name: 'overview'}") {{ $t('overview') }}
            router-link.dropdown-item(to="/groups/guild/a29da26b-37de-4a71-b0c6-48e72a900dac") {{ $t('reportBug') }}
            router-link.dropdown-item(to="/groups/guild/5481ccf3-5d2d-48a9-a871-70a7380cee5a") {{ $t('askAQuestion') }}
            a.dropdown-item(href="https://trello.com/c/odmhIqyW/440-read-first-table-of-contents", target='_blank') {{ $t('requestAF') }}
            a.dropdown-item(href="http://habitica.wikia.com/wiki/Contributing_to_Habitica", target='_blank') {{ $t('contributing') }}
            a.dropdown-item(href="http://habitica.wikia.com/wiki/Habitica_Wiki", target='_blank') {{ $t('wiki') }}
      .item-with-icon(v-if="userHourglasses != 0")
        .svg-icon(v-html="icons.hourglasses")
        span {{ userHourglasses }}
      .item-with-icon
        .svg-icon.gem(v-html="icons.gem", @click='showBuyGemsModal("gems")')
        span {{userGems | roundBigNumber}}
      .item-with-icon
        .svg-icon(v-html="icons.gold")
        span {{Math.floor(user.stats.gp * 100) / 100}}
      notification-menu
      a.dropdown.item-with-icon.item-user
        span.message-count.top-count(v-if='user.inbox.newMessages > 0') {{user.inbox.newMessages}}
        .svg-icon.user(v-html="icons.user")
        .dropdown-menu.dropdown-menu-right.user-dropdown
          a.dropdown-item.edit-avatar.dropdown-separated(@click='showAvatar()')
            h3 {{ user.profile.name }}
            span.small-text {{ $t('editAvatar') }}
          a.nav-link.dropdown-item.dropdown-separated(@click.prevent='showInbox()')
            | {{ $t('messages') }}
            span.message-count(v-if='user.inbox.newMessages > 0') {{user.inbox.newMessages}}
          a.dropdown-item(@click='showAvatar("backgrounds", "2017")') {{ $t('backgrounds') }}
          a.dropdown-item(@click='showProfile("stats")') {{ $t('stats') }}
          a.dropdown-item(@click='showProfile("achievements")') {{ $t('achievements') }}
          a.dropdown-item.dropdown-separated(@click='showProfile("profile")') {{ $t('profile') }}
          router-link.dropdown-item(:to="{name: 'site'}") {{ $t('settings') }}
          router-link.dropdown-item.dropdown-separated(:to="{name: 'subscription'}") {{ $t('subscription') }}
          a.nav-link.dropdown-item.dropdown-separated(to="/", @click.prevent='logout()') {{ $t('logout') }}
          li(v-if='!this.user.purchased.plan.customerId', @click='showBuyGemsModal("subscribe")')
            .dropdown-item.text-center
              h3.purple {{ $t('needMoreGems') }}
              span.small-text {{ $t('needMoreGemsInfo') }}
            img.float-left.align-self-end(src='~assets/images/gem-rain.png')
            button.btn.btn-primary.btn-lg.learn-button Learn More
            img.float-right.align-self-end(src='~assets/images/gold-rain.png')
    b-nav-toggle(target='nav_collapse')
</template>

<style lang="scss" scoped>
  @import '~client/assets/scss/colors.scss';
  @import '~client/assets/scss/utils.scss';

  /* Less than Desktops and laptops ----------- */
  @media only screen  and (max-width : 1224px) {
    #nav_collapse {
      background: $purple-100;
      margin-top: 1em;
      margin-left: 70%;
      padding-bottom: 1em;

      a {
        padding: .5em !important;
      }
    }

    .dropdown-menu {
      position: absolute !important;
      left: -10em;
      top: -.5em;
    }
  }

  @media only screen and (max-width : 1224px) and (min-width: 1200px) {
    #nav_collapse {
      margin-top: 37em !important;

      a {
        width: 100%;
      }
    }

    .navbar-collapse.collapse {
      display: none !important;
    }

    .navbar-collapse.collapse.show {
      display: block !important;
    }

    .navbar-toggler, .navbar-nav {
      display: block;
    }

    .navbar-toggleable-lg .navbar-collapse {
      display: block;
    }
  }

  @media only screen and (max-width: 1280px) {
    .nav-link {
      padding: .8em 1em !important;
    }
  }

  nav.navbar {
    background: $purple-100 url(~assets/svg/for-css/bits.svg) right no-repeat;
    padding-left: 25px;
    padding-right: 12.5px;
    height: 56px;
    box-shadow: 0 1px 2px 0 rgba($black, 0.24);
  }

  .navbar-header {
    margin-right: 48px;

    .logo {
      width: 128px;
      height: 28px;
    }
  }

  .nav-item {
    .nav-link {
      font-size: 16px;
      color: $white;
      font-weight: bold;
      line-height: 1.5;
      padding: 16px 24px;
      transition: none;
    }

    &:hover {
      .nav-link {
        color: $white;
        background: $purple-200;
      }
    }

    &.active:not(:hover) {
      .nav-link {
        box-shadow: 0px -4px 0px $purple-300 inset;
      }
    }
  }

  // Make the dropdown menu open on hover
  .dropdown:hover .dropdown-menu {
    display: block;
    margin-top: 0; // remove the gap so it doesn't close
  }

  .dropdown + .dropdown {
    margin-left: 0px;
  }

  .dropdown-separated {
    border-bottom: 1px solid $gray-500;
  }

  .user-dropdown {
    width: 14.75em;
  }

  .learn-button {
    margin: 0.75em 0.75em 0.75em 1em;
  }

  .purple {
    color: $purple-200;
  }

  .small-text {
    color: $gray-200;
    font-style: normal;
    display: block;
    white-space: normal;
  }

  .dropdown-menu:not(.user-dropdown) {
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

        &:last-child {
          border-bottom-right-radius: 5px;
          border-bottom-left-radius: 5px;
        }
      }
    }
  }

  .item-with-icon {
    color: $white;
    font-size: 16px;
    font-weight: normal;
    padding-top: 16px;
    padding-left: 16px;

    .svg-icon {
      vertical-align: bottom;
      display: inline-block;
      width: 20px;
      height: 20px;
      margin-right: 8px;
      margin-left: 8px;
    }
  }

  .item-notifications, .item-user {
    padding-right: 12.5px;
    padding-left: 12.5px;
    color: $header-color;
    transition: none;

    .svg-icon {
      margin-right: 0px;
      color: $header-color;

      &:hover {
        color: $white;
      }
    }
  }

  .item-user .edit-avatar {
    h3 {
      color: $gray-10;
      margin-bottom: 0px;
    }

    padding-top: 16px;
    padding-bottom: 16px;
  }

  .gem:hover {
    cursor: pointer;
  }

  .message-count {
    background-color: #46a7d9;
    border-radius: 50%;
    height: 20px;
    width: 20px;
    float: right;
    color: #fff;
    text-align: center;
    font-weight: bold;
    font-size: 12px;
  }

  .message-count.top-count {
    position: absolute;
    right: 0;
    top: .5em;
    padding: .2em;
  }
</style>

<script>
import axios from 'axios';
import bNavToggle from 'bootstrap-vue/lib/components/nav-toggle';
import bCollapse from 'bootstrap-vue/lib/components/collapse';

import { mapState, mapGetters } from 'client/libs/store';
import * as Analytics from 'client/libs/analytics';
import gemIcon from 'assets/svg/gem.svg';
import goldIcon from 'assets/svg/gold.svg';
import userIcon from 'assets/svg/user.svg';
import svgHourglasses from 'assets/svg/hourglass.svg';
import logo from 'assets/svg/logo.svg';
import InboxModal from './userMenu/inbox.vue';
import notificationMenu from './notificationMenu';
import creatorIntro from './creatorIntro';
import profile from './userMenu/profile';
import markPMSRead from 'common/script/ops/markPMSRead';

export default {
  components: {
    InboxModal,
    notificationMenu,
    creatorIntro,
    profile,
    bNavToggle,
    bCollapse,
  },
  data () {
    return {
      icons: Object.freeze({
        gem: gemIcon,
        gold: goldIcon,
        user: userIcon,
        hourglasses: svgHourglasses,
        logo,
      }),
      groupPlans: [],
    };
  },
  computed: {
    ...mapGetters({
      userGems: 'user:gems',
    }),
    ...mapState({
      user: 'user.data',
      userHourglasses: 'user.data.purchased.plan.consecutive.trinkets',
    }),
  },
  mounted () {
    this.getUserGroupPlans();
  },
  methods: {
    logout () {
      this.$store.dispatch('auth:logout');
    },
    showInbox () {
      markPMSRead(this.user);
      axios.post('/api/v3/user/mark-pms-read');
      this.$root.$emit('show::modal', 'inbox-modal');
    },
    showAvatar (startingPage, subpage) {
      this.$store.state.avatarEditorOptions.editingUser = true;
      this.$store.state.avatarEditorOptions.startingPage = startingPage;
      this.$store.state.avatarEditorOptions.subpage = subpage;
      this.$root.$emit('show::modal', 'avatar-modal');
    },
    showProfile (startingPage) {
      this.$store.state.profileUser = this.user;
      this.$store.state.profileOptions.startingPage = startingPage;
      this.$root.$emit('show::modal', 'profile');
    },
    async getUserGroupPlans () {
      this.groupPlans = await this.$store.dispatch('guilds:getGroupPlans');
    },
    openPartyModal () {
      this.$root.$emit('show::modal', 'create-party-modal');
    },
    showBuyGemsModal (startingPage) {
      this.$store.state.gemModalOptions.startingPage = startingPage;

      Analytics.track({
        hitType: 'event',
        eventCategory: 'button',
        eventAction: 'click',
        eventLabel: 'Gems > Toolbar',
      });

      this.$root.$emit('show::modal', 'buy-gems', {alreadyTracked: true});
    },
  },
};
</script>
