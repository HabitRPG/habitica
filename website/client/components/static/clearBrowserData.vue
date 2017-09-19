<template lang="pug">
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
</template>

<script>
  export default {
    data () {
      return  {
        localStorageTryFirst: {
          linkStart: '<a href="/user/settings/site" target="_blank">',
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
