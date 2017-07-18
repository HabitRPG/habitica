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
        a.btn.btn-primary.btn-lg.btn-block(:href="'mailto:vicky@habitica.com?subject=' + $t('enterprisePlansEmailSubject')") {{ $t('enterprisePlansButton') }}

      br

      .row.row-margin(style="font-size: 2rem;")
        span {{ $t('familyPlansDescription') }}
      .row.row-margin
        a.btn.btn-primary.btn-lg.btn-block(href="https://docs.google.com/forms/d/e/1FAIpQLSerMKkaCg3UcgpcMvBJtlNgnF9DNY8sxCebpAT-GHeDAQASPQ/viewform?usp=sf_link") {{ $t('familyPlansButton') }}
</template>
