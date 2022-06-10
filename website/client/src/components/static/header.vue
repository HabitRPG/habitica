<template>
  <nav class="navbar navbar-inverse fixed-top navbar-expand-md">
    <div class="navbar-header">
      <router-link
        class="nav-item"
        :to="!isUserLoggedIn ? '/static/home' : '/'"
      >
        <div
          v-if="this.$route.name === 'plans'"
          class="logo svg-icon"
          v-html="icons.purpleLogo"
        ></div>
        <div
          v-else
          class="logo svg-icon"
          v-html="icons.logo"
        ></div>
      </router-link>
    </div>
    <div class="collapse navbar-collapse">
      <ul
        v-if="$route.name !== 'home'"
        class="navbar-nav mr-auto"
      >
        <router-link
          class="nav-item"
          tag="li"
          to="/static/features"
        >
          <a
            v-once
            class="nav-link"
          >{{ $t('companyAbout') }}</a>
        </router-link>
        <router-link
          class="nav-item"
          tag="li"
          to="/static/plans"
        >
          <a
            v-once
            class="nav-link"
          >{{ $t('groupPlans') }}</a>
        </router-link>
        <li class="nav-item">
          <a
            class="nav-link"
            href="https://habitica.wordpress.com/"
            target="_blank"
          >{{ $t('companyBlog') }}</a>
        </li>
        <li class="nav-item">
          <a
            class="nav-link"
            href="https://blog.habitrpg.com/"
            target="_blank"
          >{{ $t('tumblr') }}</a>
        </li>
        <router-link
          class="nav-item"
          tag="li"
          to="/static/press-kit"
        >
          <a
            v-once
            class="nav-link"
          >{{ $t('presskit') }}</a>
        </router-link>
        <router-link
          class="nav-item"
          tag="li"
          to="/static/contact"
        >
          <a
            v-once
            class="nav-link"
          >{{ $t('contactUs') }}</a>
        </router-link>
      </ul>
      <ul
        v-else
        class="navbar-nav mr-auto"
      >
        <router-link
          class="nav-item"
          tag="li"
          to="/register"
        >
          <a
            v-once
            class="nav-link"
          >{{ $t('getStarted') }}</a>
        </router-link>
        <li class="nav-item">
          <a
            class="nav-link"
            @click="scrollToMobileApp"
          >{{ $t('mobileApps') }}</a>
        </li>
        <li class="nav-item dropdown">
          <a
            v-once
            class="nav-link dropdown-toggle"
          >{{ $t('learnMore') }}</a>
          <div class="dropdown-menu">
            <router-link
              class="dropdown-item"
              to="/static/faq"
            >
              {{ $t('faq') }}
            </router-link>
            <router-link
              class="dropdown-item"
              to="/static/plans"
            >
              {{ $t('groupPlans') }}
            </router-link>
          </div>
        </li>
      </ul>
      <button
        v-if="$route.name !== 'home'"
        class="btn btn-primary pull-right"
        @click="playButtonClick()"
      >
        {{ $t('enterHabitica') }}
      </button>
    </div>
    <router-link
      v-if="$route.name === 'home'"
      class="btn btn-primary btn-front login-button pull-right"
      to="/login"
    >
      {{ $t('login') }}
    </router-link>
  </nav>
</template>

<style lang='scss' scoped>
  @import '~@/assets/scss/colors.scss';

  @media only screen and (max-width : 750px) {
    .login-button {
      margin: 0 auto !important;
      margin-top: 1.8em !important;
    }
  }

  .home-header, .home-header .btn {
    font-family: 'Varela Round', sans-serif;
    font-weight: normal;
  }

  .btn-primary.pull-right {
    height: 2.5em;
    margin: auto 0px auto auto;
  }

  nav.navbar {
    background: $purple-100 url(~@/assets/svg/for-css/bits.svg) right no-repeat;
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
      font-size: 16px !important;
      color: $white;
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
import logo from '@/assets/svg/logo.svg';
import purpleLogo from '@/assets/svg/purple-logo.svg';

export default {
  data () {
    return {
      icons: Object.freeze({
        logo,
        purpleLogo,
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
