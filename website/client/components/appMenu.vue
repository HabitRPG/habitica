<template lang="pug">
nav.navbar.navbar-inverse.fixed-top.navbar-toggleable-sm
  .navbar-header
    div.logo(v-html="icons.logo")
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
      router-link.nav-item(tag="li", :to="{name: 'market'}", exact) 
        a.nav-link(v-once) {{ $t('market') }}
      router-link.nav-item.dropdown(tag="li", :to="{name: 'tavern'}", :class="{'active': $route.path.startsWith('/social')}")
        a.nav-link(v-once) {{ $t('social') }}
        .dropdown-menu
          router-link.dropdown-item(:to="{name: 'tavern'}") {{ $t('tavern') }}
          router-link.dropdown-item(:to="{name: 'inbox'}") {{ $t('inbox') }}
          router-link.dropdown-item(:to="{name: 'challenges'}") {{ $t('challenges') }}
          router-link.dropdown-item(:to="{name: 'party'}") {{ $t('party') }}
          router-link.dropdown-item(:to="{name: 'guildsDiscovery'}") {{ $t('guilds') }}
      router-link.nav-item.dropdown(tag="li", to="/help", :class="{'active': $route.path.startsWith('/help')}")
        a.nav-link(v-once) {{ $t('help') }}
        .dropdown-menu
          router-link.dropdown-item(to="/help/faq") {{ $t('faq') }}
          router-link.dropdown-item(to="/help/report-bug") {{ $t('reportBug') }}
          router-link.dropdown-item(to="/help/request-feature") {{ $t('requestAF') }}
    .item-with-icon
      .icon(v-html="icons.gem")
      span {{userGems}}
    .item-with-icon
      .icon(v-html="icons.gold")
      span {{user.stats.gp | floor}}
    .item-with-icon.item-notifications
      .svgicon.icon(v-html="icons.notifications")
    router-link.dropdown.item-with-icon.item-user(:to="{name: 'avatar'}")
      .svgicon.icon(v-html="icons.user")
      .dropdown-menu.dropdown-menu-right.user-dropdown
        router-link.dropdown-item.edit-avatar(:to="{name: 'avatar'}") 
          h3 {{ user.profile.name }}
          span.small-text {{ $t('editAvatar') }}
        //.dropdown-divider
        router-link.dropdown-item(:to="{name: 'stats'}") {{ $t('stats') }}
        router-link.dropdown-item(:to="{name: 'achievements'}") {{ $t('achievements') }}
        router-link.dropdown-item(:to="{name: 'settings'}") {{ $t('settings') }}
        router-link.dropdown-item(to="/logout") {{ $t('logout') }}
</template>

<style lang="scss" scoped>
@import '~client/assets/scss/colors.scss';

nav.navbar {
  background: $purple-100 url(~assets/header/bits.svg) right no-repeat;
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

  .icon {
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
  &:hover {
    color: $white;
  }

  .icon {
    margin-right: 0px;
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
const IconLogo = require('!svg-inline-loader!assets/header/logo.svg');
const IconGem = require('!svg-inline-loader!assets/header/gem.svg');
const IconGold = require('!svg-inline-loader!assets/header/gold.svg');
const IconUser = require('!svg-inline-loader!assets/header/user.svg');
const IconNotifications = require('!svg-inline-loader!assets/header/notifications.svg');

import { mapState, mapGetters } from 'client/libs/store';

export default {
  data () {
    return {
      icons: {
        logo: IconLogo,
        gem: IconGem,
        gold: IconGold,
        user: IconUser,
        notifications: IconNotifications,
      },
    };
  },
  computed: {
    ...mapGetters({
      userGems: 'user:gems',
    }),
    ...mapState({user: 'user.data'}),
  },
};
</script>