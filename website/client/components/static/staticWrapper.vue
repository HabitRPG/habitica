<template lang='pug'>
  div
    static-header

    .static-wrapper
      router-view

    #purple-footer
      app-footer
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
