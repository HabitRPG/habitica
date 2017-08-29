<template lang="pug">
  div
    static-header
    .container-fluid.text-center
      .row
        .col-md-6.offset-3
          h1 {{ $t('clearBrowserData') }}

          p(v-html="$t('localStorageTryFirst', localStorageTryFirst) ")
          br
          p.text-center
            button.btn.btn-lg.btn-danger(@click='clearLocalStorage()',
              popover-trigger='mouseover', :popover="$t('localStorageClearExplanation')")
              | {{ $t('localStorageClear') }}
          br
          p(v-html="$t('localStorageTryNext', localStorageTryNext) ")
    app-footer
</template>

<style lang='scss' scoped>
  @import '~client/assets/scss/static.scss';

  .container-fluid {
    margin-top: 56px;
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
    data () {
      return  {
        localStorageTryFirst: {
          linkStart: '<a href="/#/options/settings/settings" target="_blank">',
          linkEnd: '</a>',
        },
        localStorageTryNext: {
          linkStart: '<a href="https://github.com/HabitRPG/habitica/issues/2760" target="_blank">',
          linkEnd: '</a>',
        },
      };
    },
    methods: {
      clearLocalStorage () {
        this.$store.dispatch('auth:logout');
      },
    },
  };
</script>
