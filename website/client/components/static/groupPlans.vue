<template lang="pug">
  div
    .container-fluid
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
          // TODO
          a.btn.btn-primary.btn-lg.btn-block(:href="'mailto:vicky@habitica.com?subject=' + enterprisePlansEmailSubject") {{ $t('enterprisePlansButton') }}

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
  import * as Analytics from 'client/libs/analytics';
  
  export default {
    components: {
      StaticHeader,
    },
    data () {
      return {
        enterprisePlansEmailSubject: 'Question regarding Enterprise Plans',
      };
    },
    methods: {
      goToNewGroupPage () {
        if (!this.$store.state.isUserLoggedIn) {
          this.$router.push({
            name: 'register',
            query: {
              redirectTo: '/group-plans',
            },
          });
          return;
        }

        this.$router.push('/group-plans');
      },
      contactUs () {
        Analytics.track({
          hitType: 'event',
          eventCategory: 'button',
          eventAction: 'click',
          eventLabel: 'Contact Us (Plans)',
        });

        window.location.href = `mailto:vicky@habitica.com?subject=${ this.enterprisePlansEmailSubject }`;
      },
    },
  };
</script>
