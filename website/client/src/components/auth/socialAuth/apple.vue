<template>
  <div
    :class="{
      'btn': true,
      'btn-secondary': true,
      'social-button': true,
      'social-button-home': isHomePage,
    }"
    @click="socialAuth('apple')"
  >
    <div
      class="svg-icon social-icon apple-icon"
      v-html="icons.appleIcon"
    ></div>
    <span>{{ registering
      ? $t('signUpWithSocial', {social: 'Apple'})
      : $t('loginWithSocial', {social: 'Apple'}) }}</span>
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
  },
  methods: {
    async socialAuth () {
      window.location.href = buildAppleAuthUrl();
    },
  },
};
</script>
