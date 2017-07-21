<template lang="pug">
div
  inbox-modal
  nav.navbar.navbar-inverse.fixed-top.navbar-toggleable-sm
    .navbar-header
      .logo.svg-icon(v-html="icons.logo")
    .collapse.navbar-collapse
      ul.navbar-nav.mr-auto
        router-link.nav-item(tag="li", :to="{name: 'tasks'}", exact)
          a.nav-link(v-once) {{ $t('tasks') }}
        router-link.nav-item.dropdown(tag="li", :to="{name: 'items'}", :class="{'active': $route.path.startsWith('/inventory')}")
          a.nav-link(v-once) {{ $t('inventory') }}
          .dropdown-menu
            router-link.dropdown-item(:to="{name: 'items'}", exact) {{ $t('items') }}
            router-link.dropdown-item(:to="{name: 'equipment'}") {{ $t('equipment') }}
            router-link.dropdown-item(:to="{name: 'stable'}") {{ $t('stable') }}
        router-link.nav-item(tag="li", :to="{name: 'shops'}", exact)
          a.nav-link(v-once) {{ $t('shops') }}
        router-link.nav-item(tag="li", :to="{name: 'party'}")
          a.nav-link(v-once) {{ $t('party') }}
        router-link.nav-item.dropdown(tag="li", :to="{name: 'tavern'}", :class="{'active': $route.path.startsWith('/guilds')}")
          a.nav-link(v-once) {{ $t('guilds') }}
          .dropdown-menu
            router-link.dropdown-item(:to="{name: 'tavern'}") {{ $t('tavern') }}
            router-link.dropdown-item(:to="{name: 'myGuilds'}") {{ $t('myGuilds') }}
            router-link.dropdown-item(:to="{name: 'guildsDiscovery'}") {{ $t('guildsDiscovery') }}
        router-link.nav-item(tag="li", :to="{name: 'myChallenges'}", exact)
          a.nav-link(v-once) {{ $t('challenges') }}
        router-link.nav-item.dropdown(tag="li", to="/help", :class="{'active': $route.path.startsWith('/help')}")
          a.nav-link(v-once) {{ $t('help') }}
          .dropdown-menu
            router-link.dropdown-item(:to="{name: 'faq'}") {{ $t('faq') }}
            router-link.dropdown-item(:to="{name: 'overview'}") {{ $t('overview') }}
            router-link.dropdown-item(to="/groups/a29da26b-37de-4a71-b0c6-48e72a900dac") {{ $t('reportBug') }}
            router-link.dropdown-item(to="/groups/5481ccf3-5d2d-48a9-a871-70a7380cee5a") {{ $t('askAQuestion') }}
            a.dropdown-item(href="https://trello.com/c/odmhIqyW/440-read-first-table-of-contents", target='_blank') {{ $t('requestAF') }}
            a.dropdown-item(href="http://habitica.wikia.com/wiki/Contributing_to_Habitica", target='_blank') {{ $t('contributing') }}
            a.dropdown-item(href="http://habitica.wikia.com/wiki", target='_blank') {{ $t('wiki') }}
      .item-with-icon
        .svg-icon(v-html="icons.gem")
        span {{userGems | roundBigNumber}}
      .item-with-icon
        .svg-icon(v-html="icons.gold")
        span {{user.stats.gp | roundBigNumber}}
      .item-with-icon.item-notifications
        .svg-icon(v-html="icons.notifications")
      router-link.dropdown.item-with-icon.item-user(:to="{name: 'avatar'}")
        .svg-icon(v-html="icons.user")
        .dropdown-menu.dropdown-menu-right.user-dropdown
          router-link.dropdown-item.edit-avatar(:to="{name: 'avatar'}")
            h3 {{ user.profile.name }}
            span.small-text {{ $t('editAvatar') }}
          a.nav-link.dropdown-item(@click.prevent='showInbox()') {{ $t('inbox') }}
          router-link.dropdown-item(:to="{name: 'backgrounds'}") {{ $t('backgrounds') }}
          router-link.dropdown-item(:to="{name: 'stats'}") {{ $t('stats') }}
          router-link.dropdown-item(:to="{name: 'achievements'}") {{ $t('achievements') }}
          router-link.dropdown-item(:to="{name: 'profile'}") {{ $t('profile') }}
          router-link.dropdown-item(:to="{name: 'site'}") {{ $t('settings') }}
          a.nav-link.dropdown-item(to="/", @click.prevent='logout()') {{ $t('logout') }}
</template>

<style lang="scss" scoped>
  @import '~client/assets/scss/colors.scss';
  @import '~client/assets/scss/utils.scss';

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
      vertical-align: middle;
      width: 24px;
      height: 24px;
      margin-right: 8px;
      float: left;
    }
  }

  .item-notifications, .item-user {
    padding-right: 12.5px;
    padding-left: 12.5px;
    color: $header-color;
    transition: none;

    &:hover {
      color: $white;
    }

    .svg-icon {
      margin-right: 0px;
      color: inherit;
    }
  }

  .item-notifications {
    margin-left: 33.5px;
  }

  .item-user .edit-avatar {
    h3 {
      color: $gray-10;
      margin-bottom: 0px;
    }

    .small-text {
      color: $gray-200;
      font-style: normal;
      display: block;
    }

    padding-top: 16px;
    padding-bottom: 16px;
  }
</style>

<script>
import { mapState, mapGetters } from 'client/libs/store';
import gemIcon from 'assets/svg/gem.svg';
import goldIcon from 'assets/svg/gold.svg';
import notificationsIcon from 'assets/svg/notifications.svg';
import userIcon from 'assets/svg/user.svg';
import logo from 'assets/svg/logo.svg';
import InboxModal from './userMenu/inbox.vue';

export default {
  components: {
    InboxModal,
  },
  data () {
    return {
      icons: Object.freeze({
        gem: gemIcon,
        gold: goldIcon,
        notifications: notificationsIcon,
        user: userIcon,
        logo,
      }),
    };
  },
  computed: {
    ...mapGetters({
      userGems: 'user:gems',
    }),
    ...mapState({user: 'user.data'}),
  },
  methods: {
    logout () {
      localStorage.removeItem('habit-mobile-settings');
      this.$router.go('/');
    },
    showInbox () {
      this.$root.$emit('show::modal', 'inbox-modal');
    },
  },
};
</script>
