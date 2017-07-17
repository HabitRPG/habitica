<template lang="pug">
  div
    // @TODO: +groupPlansBenefits

    br
    br
    .row
      .col-sm-6.col-sm-offset-3
        a.btn.btn-primary.btn-lg.btn-block(ng-click="goToNewGroupPage()") {{ $t('getAGroupPlanToday') }}

    .row
      .col-md-6.col-md-offset-3
        br
        .text-center {{ $t('groupSubscriptionPrice') }}

    hr

    .col-md-6.col-md-offset-3.text-center
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
