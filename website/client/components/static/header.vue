<template lang="pug">
  nav.navbar.navbar-inverse.fixed-top.navbar-toggleable-sm
    .navbar-header
      router-link.nav-item(
        to='/home',
      )
        .logo.svg-icon(v-html='icons.logo')
    .collapse.navbar-collapse
      ul.navbar-nav.mr-auto
        router-link.nav-item(
          tag='li',
          to='/static/features',
        )
          a.nav-link(v-once) {{ $t('companyAbout') }}
        router-link.nav-item(
          tag='li',
          to='/static/plans',
        )
          a.nav-link(v-once) {{ $t('groupPlans') }}
        li.nav-item
          a.nav-link(
          href='https://habitica.wordpress.com/',
          target='_blank',
        ) {{ $t('companyBlog') }}
        li.nav-item
          a.nav-link(
          href='http://blog.habitrpg.com/',
          target='_blank',
        ) {{ $t('tumblr') }}
        router-link.nav-item(
          tag='li',
          to='/static/press-kit',
        )
          a.nav-link(v-once) {{ $t('presskit') }}
        router-link.nav-item(
          tag='li',
          to='/static/contact',
        )
          a.nav-link(v-once) {{ $t('contactUs') }}
      button.btn.btn-primary.pull-right(@click='playButtonClick()') {{ $t('playButtonFull') }}
</template>

<style lang='scss' scoped>
  @import '~client/assets/scss/colors.scss';

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
</style>

<script>
  import logo from 'assets/svg/logo.svg';

  export default {
    data () {
      return {
        icons: Object.freeze({
          logo,
        }),
      };
    },
    methods: {
      playButtonClick () {
        this.$router.push('/register');
      },
    },
  };
</script>
