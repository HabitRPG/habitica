<template lang='pug'>
  div
    static-header

    .static-wrapper
      router-view

    #purple-footer
      app-footer

    #bottom-wrap.purple-4
      #bottom-background
        .seamless_mountains_demo_repeat
        .midground_foreground_extended2
</template>

<style lang='scss'>
  @import '~client/assets/scss/colors.scss';

  #purple-footer {
    background-color: #271b3d;

    footer, footer a {
      background: transparent;
      color: #d5c8ff;
    }

    .logo {
      color: #bda8ff;
    }

    .social-circle, .btn-donate {
      background: #36205d;
      color: #bda8ff;

      .svg-icon {
        color: #bda8ff;
      }
    }
  }

  #bottom-wrap {
    padding-top: 10em;
    background-color: #271b3d;
  }

  #bottom-background {
    position: relative;

    .seamless_mountains_demo_repeat {
      background-image: url('~assets/images/auth/seamless_mountains_demo.png');
      background-repeat: repeat-x;
      width: 100%;
      height: 500px;
      position: absolute;
      z-index: 0;
      bottom: 0;
    }

    .midground_foreground_extended2 {
      background-image: url('~assets/images/auth/midground_foreground_extended2.png');
      position: relative;
      width: 1500px;
      max-width: 100%;
      height: 150px;
      margin: 0 auto;
    }
  }

  .static-wrapper {
    .container-fluid {
      margin: 5em 2em 2em 2em;
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

<script>
  import AppFooter from 'client/components/appFooter';
  import StaticHeader from './header.vue';

  export default {
    components: {
      AppFooter,
      StaticHeader,
    },
  };
</script>
