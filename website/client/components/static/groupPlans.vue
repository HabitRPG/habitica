<template lang="pug">
  div
    // @TODO: Replace with Zeplin  +groupPlansBenefits

    br
    br
    .row
      .col-6.offset-3
        button.btn.btn-primary.btn-lg.btn-block(ng-click="goToNewGroupPage()") {{ $t('getAGroupPlanToday') }}

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
        a.btn.btn-primary.btn-lg.btn-block(:href="'mailto:vicky@habitica.com?subject=' + $t('enterprisePlansEmailSubject')") {{ $t('enterprisePlansButton') }}

      br

      .row.row-margin(style="font-size: 2rem;")
        span {{ $t('familyPlansDescription') }}
      .row.row-margin
        a.btn.btn-primary.btn-lg.btn-block(href="https://docs.google.com/forms/d/e/1FAIpQLSerMKkaCg3UcgpcMvBJtlNgnF9DNY8sxCebpAT-GHeDAQASPQ/viewform?usp=sf_link") {{ $t('familyPlansButton') }}
</template>

<script>
import * as Analytics from 'client/libs/analytics';

export default {
  methods: {
    contactUs () {
      Analytics.track({
        hitType: 'event',
        eventCategory: 'button',
        eventAction: 'click',
        eventLabel: 'Contact Us (Plans)',
      });

      window.location.href = `mailto:vicky@habitica.com?subject=${this.$t('enterprisePlansEmailSubject')}`;
    },
  },
};
</script>
