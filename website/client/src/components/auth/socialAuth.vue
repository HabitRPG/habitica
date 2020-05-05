<template>
  <div
    class="social-button"
    @click="socialAuth(network)"
  >
    <div
      class="svg-icon social-icon"
      v-html="socialIcon"
    ></div>
    <span>{{ $t(login?'loginWithSocial':'signUpWithSocial', translateOptions)}}</span>
  </div>
</template>

<style lang="scss" scoped>
  .social-button {
    width: 100%;
    height: 100%;
    white-space: inherit;
    text-align: center;

    .text {
      display: inline-block;
    }
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
import { startCase } from 'lodash';
import { buildAppleAuthUrl } from '@/libs/auth';
import googleIcon from '@/assets/svg/google.svg';
import facebookSquareIcon from '@/assets/svg/facebook-square.svg';
import appleIcon from '@/assets/svg/apple_black.svg';

export default {
  props: {
    network: {
      type: String,
      required: true,
    },
    login: {
      type: Boolean,
      default: false,
    },
  },
  data () {
    const data = {};
    data.icons = Object.freeze({
      googleIcon,
      facebookIcon: facebookSquareIcon,
      appleIcon,
    });
    return data;
  },
  computed: {
    isHomePage () {
      if (this.$route.path.startsWith('/static/home')) {
        return true;
      }
      return false;
    },
    translateOptions () {
      return {
        social: startCase(this.network),
      };
    },
    socialIcon () {
      return this.icons[`${this.network}Icon`];
    },
  },
  methods: {
    async socialAuth () {
      if (this.network === 'apple') {
        window.location.href = buildAppleAuthUrl();
        return;
      }

      const redirectUrl = `${window.location.protocol}//${window.location.host}`;
      this.$store.dispatch('auth:facebookOrGoogleAuth', {
        network: this.network,
        redirectUrl,
      });
    },
  },
};
</script>
