<template>
  <div
    :class="{
      'btn': !isHomePage,
      'btn-secondary': !isHomePage,
      'social-button': true,
      'social-button-home': isHomePage,
    }"
    @click="socialAuth('apple')"
  >
    <div
      class="svg-icon social-icon apple-icon"
      v-html="icons.appleIcon"
    ></div>
    <span>{{ $t(showSignUp?'signUpWithSocial':'loginWithSocial', {social: 'Apple'})}}</span>
  </div>
</template>

<style lang="scss">
  .social-button {
    width: 100%;
    height: 100%;
    white-space: inherit;
    text-align: center;

    .text {
      display: inline-block;
    }
  }

  .social-button-home {
    border-radius: 2px;
    border: solid 2px #bda8ff;
    width: 100%;
    min-height: 40px;
    padding: .5em;
    background: transparent;
    margin-bottom: .5em;
    color: #bda8ff;
    transition: .5s;

    span {
      transition: none;
    }
  }

  .social-button-home:hover {
    cursor: pointer;
    border-color: #fff;
    color: #fff;
  }

  .apple-icon {
    margin-top: -1px;
  }

  .social-icon {
    margin-left: 1em;
    margin-right: 1em;
    width: 18px;
    height: 18px;
    display: inline-block;
    vertical-align: top;
    margin-top: .1em;
  }
</style>

<script>
import { buildAppleAuthUrl } from '@/libs/auth';
import appleIcon from '@/assets/svg/apple_black.svg';

export default {
  data () {
    const data = {};
    data.icons = Object.freeze({
      appleIcon,
    });
    return data;
  },
  computed: {
    registering () {
      if (this.$route.path.startsWith('/register')) {
        return true;
      }
      return false;
    },
    isHomePage () {
      if (this.$route.path.startsWith('/static/home')) {
        return true;
      }
      return false;
    },
    isGroupPlansPage () {
      if (this.$route.path.startsWith('/static/plan')
      || this.$route.path.startsWith('/static/group-plans')) {
        return true;
      }
      return false;
    },
    showSignUp () {
      return this.registering || this.isHomePage || this.isGroupPlansPage;
    },
  },
  methods: {
    async socialAuth () {
      window.location.href = buildAppleAuthUrl();
    },
  },
};
</script>
