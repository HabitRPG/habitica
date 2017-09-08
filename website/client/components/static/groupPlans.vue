<template lang="pug">
div
  static-header
  .container-fluid.main
    .row
      .col-6.offset-3
        button.btn.btn-primary.btn-lg.btn-block(@click="goToNewGroupPage()") {{ $t('getAGroupPlanToday') }}

    .row
      .col-6.offset-3
        br
        .text-center {{ $t('groupSubscriptionPrice') }}

    hr

    .col-6.offset-3.text-center
      .row.row-margin(style="font-size: 2rem;")
        span {{ $t('enterprisePlansDescription') }}
      .row.row-margin
        a.btn.btn-primary.btn-lg.btn-block(:href="'mailto:vicky@habitica.com?subject=' + $t('enterprisePlansEmailSubject')") {{ $t('enterprisePlansButton') }}

      br

      .row.row-margin(style="font-size: 2rem;")
        span {{ $t('familyPlansDescription') }}
      .row.row-margin
        a.btn.btn-primary.btn-lg.btn-block(href="https://docs.google.com/forms/d/e/1FAIpQLSerMKkaCg3UcgpcMvBJtlNgnF9DNY8sxCebpAT-GHeDAQASPQ/viewform?usp=sf_link") {{ $t('familyPlansButton') }}
</template>

<style lang='scss' scoped>
  .main {
    margin-top: 6em;
  }
</style>

<script>
  import StaticHeader from './header.vue';

  export default {
    components: {
      StaticHeader,
    },
    methods: {
      goToNewGroupPage () {
        if (!this.$store.state.isUserLoggedIn) {
          this.$store.state.afterLoginRedirect = '/group-plans';
          this.$router.push('/register');
          return;
        }

        this.$router.push('/group-plans');
      },
    },
  };
</script>
