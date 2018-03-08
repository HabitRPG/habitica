<template lang="pug">
  nav.navbar.navbar-inverse.fixed-top.navbar-expand-sm
    .navbar-header
      router-link.nav-item(:to='!isUserLoggedIn ? "/static/home" : "/"')
        .logo.svg-icon(v-html='icons.logo')
    .collapse.navbar-collapse
      ul.navbar-nav.mr-auto(v-if='$route.name !== "home"')
        router-link.nav-item(tag='li', to='/static/features')
          a.nav-link(v-once) {{ $t('companyAbout') }}
        router-link.nav-item(tag='li', to='/static/plans')
          a.nav-link(v-once) {{ $t('groupPlans') }}
        li.nav-item
          a.nav-link(href='https://habitica.wordpress.com/', target='_blank') {{ $t('companyBlog') }}
        li.nav-item
          a.nav-link(href='http://blog.habitrpg.com/', target='_blank') {{ $t('tumblr') }}
        router-link.nav-item(tag='li', to='/static/press-kit')
          a.nav-link(v-once) {{ $t('presskit') }}
        router-link.nav-item(tag='li', to='/static/contact')
          a.nav-link(v-once) {{ $t('contactUs') }}
      ul.navbar-nav.mr-auto(v-else)
        router-link.nav-item(tag='li', to='/register')
          a.nav-link(v-once) {{ $t('getStarted') }}
        li.nav-item
          a.nav-link(@click='scrollToMobileApp') {{ $t('mobileApps') }}
        li.nav-item.dropdown
          a.nav-link.dropdown-toggle(v-once) {{ $t('learnMore') }}
          .dropdown-menu
            router-link.dropdown-item(to='/static/faq') {{ $t('faq') }}
            router-link.dropdown-item(to='/static/plans') {{ $t('groupPlans') }}
      button.btn.btn-primary.pull-right(@click='playButtonClick()', v-if='$route.name !== "home"') {{ $t('playButtonFull') }}
    router-link.btn.btn-primary.login-button.pull-right(to='/login', v-if='$route.name === "home"') {{ $t('login') }}
</template>

<style lang='scss' scoped>
  @import '~client/assets/scss/colors.scss';

  @media only screen and (max-width : 750px) {
    .login-button {
      margin: 0 auto !important;
      margin-top: 1.8em !important;
    }
  }

  .btn-primary.pull-right {
    height: 2.5em;
    margin: auto 0px auto auto;
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

  .dropdown-menu:not(.user-dropdown) {
    border-radius: 0px;
    border: none;
    box-shadow: none;
    padding: 0px;
    border-bottom-right-radius: 5px;
    border-bottom-left-radius: 5px;

    .dropdown-item {
      font-size: 12px;
      padding-top: .5em !important;
      box-shadow: none;
      border: none;
      text-align: center;
      color: #4f2a93 !important;

      &.active {
        background: $purple-300;
      }

      &:hover {
        background-color: #9a62ff !important;
        color: $white !important;

        &:last-child {
          border-bottom-right-radius: 5px;
          border-bottom-left-radius: 5px;
        }
      }
    }
  }

  .home-header {
    .nav-item:hover .nav-link {
      background: transparent;
    }

    .dropdown-menu {
      border-radius: 4px;
      padding-top: .5em;
      padding-bottom: .5em;

      .dropdown-item {
        border-radius: 0px !important;
      }
    }
  }
</style>

<script>
import logo from 'assets/svg/logo.svg';
import * as Analytics from 'client/libs/analytics';

export default {
  data () {
    return {
      icons: Object.freeze({
        logo,
      }),
    };
  },
  computed: {
    isUserLoggedIn () {
      return this.$store.state.isUserLoggedIn;
    },
  },
  methods: {
    playButtonClick () {
      if (this.isUserLoggedIn) {
        this.$router.push('/');
        return;
      }

      // @TODO duplicate of code in home.vue
      Analytics.track({
        hitType: 'event',
        eventCategory: 'button',
        eventAction: 'click',
        eventLabel: 'Play',
      });

      this.$router.push('/register');
    },
    scrollToMobileApp () {
      document.querySelector('#level-up-anywhere').scrollIntoView({
        behavior: 'smooth',
      });
    },
  },
};
</script>
