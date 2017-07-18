<template lang="pug">
.row
  .col-md-6
    h2 {{ $t('promoCode') }}
    form.form-inline(role='form',ng-submit='enterCoupon(_couponCode)')
      input.form-control(type='text', ng-model='_couponCode', placeholder {{ $t('promoPlaceholder') }})
      button.btn.btn-primary(type='submit') {{ $t('submit') }}
    div
      small {{ $t('couponText') }}
    div(ng-if='user.contributor.sudo')
      hr
      h4 {{ $t('generateCodes') }}
      form.form(role='form',ng-submit='generateCodes(_codes)',ng-init='_codes={}')
        .form-group
          input.form-control(type='text',ng-model='_codes.event',placeholder="Event code (eg, 'wondercon')")
        .form-group
          input.form-control(type='number',ng-model='_codes.count',placeholder="Number of codes to generate (eg, 250)")
        .form-group
          button.btn.btn-primary(type='submit') {{ $t('generate') }}
          a.btn.btn-default(:href='"/api/v3/coupons?_id={{user._id}}&apiToken=" + User.settings.auth.apiToken') {{ $t('getCodes') }}
</template>
