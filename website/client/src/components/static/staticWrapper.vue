<template>
  <div>
    <static-header
      v-if="showContentWrap"
      :class="{
        'home-header': ['home', 'front'].indexOf($route.name) !== -1,
        'white-header': this.$route.name === 'plans'
      }"
    />
    <div class="static-wrapper">
      <router-view />
    </div>
    <div
      v-if="showContentWrap"
      :id="footerId"
    >
      <app-footer />
    </div>
    <div
      v-if="showContentWrap && footerId"
      id="bottom-wrap"
      class="purple-4"
    >
      <div id="bottom-background">
        <div class="seamless_mountains_demo_repeat"></div>
        <div class="midground_foreground_extended2"></div>
      </div>
    </div>
  </div>
</template>

<style lang="scss">
  @import '~@/assets/scss/colors.scss';

  .home-header {
    background: #6133b4 !important;
    position: static;
    box-shadow: none !important;
    height: 100px !important;
    padding-left: 5em !important;
    padding-right: 5em !important;

    .logo.svg-icon {
      width: 200px !important;
    }

    .nav-item a {
      font-size: 14px !important;
      color: #d5c8ff !important;
      padding-top: 2.8em !important;
    }

    .nav-item a:hover {
      background: transparent !important;
      color: #fff !important;
    }

    .nav-item .nav-link {
      transition: color .5s ease;
    }

    .login-button {
      padding-right: 1em;
      margin-top: 1.8em !important;
      border-radius: 2px;
      background-color: #9a62ff;
    }

    .login-button:hover {
      background-color: #b288ff;
      box-shadow: 0 4px 4px 0 rgba(26, 24, 29, 0.16), 0 1px 8px 0 rgba(26, 24, 29, 0.12) !important;
    }
  }

  .white-header {
    background: #fff !important;
    background-color: #fff !important;

    a {
      color: #271b3d !important;
    }

    a:hover {
      color: #fff !important;
    }
  }

  #purple-footer {
    background-color: #271b3d;

    .row {
      margin: 0;
    }

    footer, footer a {
      background: transparent;
      color: #d5c8ff;
    }

    .logo {
      color: #bda8ff;
    }

    .social-circle, .btn-contribute {
      background: #36205d;
      color: #bda8ff;

      .svg-icon {
        color: #bda8ff;
      }
    }
  }

  .static-wrapper {
    .container-fluid {
      margin: 5em 2em 2em 2em;
      width: auto;
    }

    h1, h2 {
      margin-top: 0.5em;
      color: $purple-200;
    }

    h3, h4 {
      color: $purple-200;
    }

    li, p {
      font-size: 16px;
    }

    .media img {
      margin: 1em;
    }

    .strong {
      font-weight: bold;
    }
  }
</style>

<style lang="scss" scoped>
  #bottom-wrap.purple-4 {
    background-color: #271b3d;
  }

  #bottom-wrap {
    padding-top: 10em;
  }

  #bottom-background {
    position: relative;

    .seamless_mountains_demo_repeat {
      background-image: url('~@/assets/images/auth/seamless_mountains_demo.png');
      background-repeat: repeat-x;
      width: 100%;
      height: 300px;
      position: absolute;
      z-index: 0;
      bottom: 0;
    }

    .midground_foreground_extended2 {
      background-image: url('~@/assets/images/auth/midground_foreground_extended2.png');
      position: relative;
      width: 1500px;
      max-width: 100%;
      height: 150px;
      margin: 0 auto;
    }
  }
</style>

<script>
import AppFooter from '@/components/appFooter';
import StaticHeader from './header.vue';

export default {
  components: {
    AppFooter,
    StaticHeader,
  },
  computed: {
    showContentWrap () {
      return this.$route.name !== 'news';
    },
    footerId () {
      if (this.$route.name === 'plans') return null;
      return 'purple-footer';
    },
  },
};
</script>
