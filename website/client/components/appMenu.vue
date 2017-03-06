<template lang="pug">
nav.navbar.navbar-inverse.fixed-top.navbar-toggleable-sm
  .navbar-header
    // TODO srcset / svg images
    img(src="~assets/header/png/logo@3x.png")
  .collapse.navbar-collapse
    ul.navbar-nav.mr-auto
      router-link.nav-item(tag="li", :to="{name: 'tasks'}", exact) 
        a.nav-link(v-once) {{ $t('tasks') }}
      router-link.nav-item.dropdown(tag="li", :to="{name: 'inventory'}", :class="{'active': $route.path.startsWith('/inventory')}")
        a.nav-link(v-once) {{ $t('inventory') }}
        .dropdown-menu
          router-link.dropdown-item(:to="{name: 'inventory'}", exact) {{ $t('inventory') }}
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
      img(src="~assets/header/png/gem@3x.png")
      span {{userGems}}
    .item-with-icon
      img(src="~assets/header/png/gold@3x.png")
      span {{user.stats.gp | floor}}
    .item-with-icon
      img(src="~assets/header/png/notifications@3x.png")
    router-link.dropdown.item-with-icon(:to="{name: 'avatar'}")
      // TODO icons should be white when active
      img(src="~assets/header/png/user@3x.png")
      .dropdown-menu.dropdown-menu-right.user-dropdown
        router-link.dropdown-item(:to="{name: 'avatar'}") {{ $t('editAvatar') }}
        // .dropdown-divider
        router-link.dropdown-item(:to="{name: 'stats'}") {{ $t('stats') }}
        router-link.dropdown-item(:to="{name: 'achievements'}") {{ $t('achievements') }}
        // .dropdown-divider
        router-link.dropdown-item(:to="{name: 'settings'}") {{ $t('settings') }}
        // .dropdown-divider
        router-link.dropdown-item(to="/logout") {{ $t('logout') }}
</template>

<style lang="scss" scoped>
nav.navbar {
  background: #432874 url(~assets/header/png/bits.png) right no-repeat;
  padding: 0 1.5rem;
  height: 56px;
}

.navbar-header {
  margin-right: 3rem;

  img {
    height: 28px;
  }
}

$active-purple: #6133b4;

.nav-item {
  .nav-link {
    color: #fff;
    font-weight: bold;
    line-height: 1.5;
    padding: 1rem 1.5rem;
  }

  &:hover {
    .nav-link {
      color: #fff;
      background: $active-purple;
    }
  }

  &.active,&:hover {
    .nav-link {
      box-shadow: 0px -4px 0px #6133b4 inset;
    }
  }
}

// Make the dropdown menu open on hover
.dropdown:hover .dropdown-menu {
  display: block;
  margin-top: 0; // remove the gap so it doesn't close
}

.dropdown-menu:not(.user-dropdown) {
  background: $active-purple;
  border-radius: 0px;
  border: none;

  .dropdown-item {
    color: #fff;

    &.active {
      background: $active-purple;
    }

    &:hover {
      background: #4f2a93;
    }
  }
}

.item-with-icon {
  color: #fff;
  font-weight: bold;
  padding: 0.75rem 0;
  padding-left: 1rem;

  img {
    vertical-align: middle;
    width: 32px;
    height: 32px;
    margin-right: 0.5rem;
  }
}
</style>

<script>
import { mapState, mapGetters } from '../store';

export default {
  computed: {
    ...mapGetters({
      userGems: 'user:gems',
    }),
    ...mapState(['user']),
  },
};
</script>