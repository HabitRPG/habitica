<template>
  <div
    :class="{
      'btn': !isHomePage,
      'btn-secondary': !isHomePage,
      'social-button': true,
      'social-button-home': isHomePage,
    }"
    @click="socialAuth('facebook')"
  >
    <div
      class="svg-icon social-icon"
      v-html="icons.facebookIcon"
    ></div>
    <span>{{ registering
      ? $t('signUpWithSocial', {social: 'Facebook'})
      : $t('loginWithSocial', {social: 'Facebook'}) }}</span>
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
import hello from 'hellojs';
import { setUpAxios } from '@/libs/auth';
import facebookSquareIcon from '@/assets/svg/facebook-square.svg';

export default {
  data () {
    const data = {};
    data.icons = Object.freeze({
      facebookIcon: facebookSquareIcon,
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
  },
  methods: {
    async socialAuth (network) {
      try {
        await hello(network).logout();
      } catch (e) {} // eslint-disable-line

      try {
        const redirectUrl = `${window.location.protocol}//${window.location.host}`;
        const auth = await hello(network).login({
          scope: 'email',
          redirect_uri: redirectUrl, // eslint-disable-line camelcase
        });

        await this.$store.dispatch('auth:socialAuth', {
          auth,
        });

        await this.finishAuth();
      } catch (err) {
        console.error(err); // eslint-disable-line no-console
        // logout the user
        await hello(network).logout();
        this.socialAuth(network); // login again
      }
    },
    async finishAuth () {
      setUpAxios();

      await this.$store.dispatch('user:fetch', { forceLoad: true });

      this.$emit('authenticate');
    },
  },
};
</script>
