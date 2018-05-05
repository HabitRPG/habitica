<template lang="pug">
  .container-fluid.text-center
    .row
      .col-md-6.offset-3
        h1 {{ $t('checkOutMobileApps') }}
        .promo_habitica(style='border-radius:25px;margin:auto;margin-bottom:30px')

        a(href='https://play.google.com/store/apps/details?id=com.habitrpg.android.habitica&utm_source=global_co&utm_medium=prtnr&utm_content=Mar2515&utm_campaign=PartBadge&pcampaignid=MKT-AC-global-none-all-co-pr-py-PartBadges-Oct1515-1&utm_source=global_co&utm_medium=prtnr&utm_content=Mar2515&utm_campaign=PartBadge&pcampaignid=MKT-AC-global-none-all-co-pr-py-PartBadges-Oct1515-1')
          img(alt='Get it on Google Play', src='https://play.google.com/intl/en_us/badges/images/apps/en-play-badge.png', style='width:139px;height:45px;image-rendering:auto;vertical-align:top')
        a(href='https://geo.itunes.apple.com/us/app/habitica/id994882113?mt=8', style='display:inline-block;overflow:hidden;background:url(http://linkmaker.itunes.apple.com/images/badges/en-us/badge_appstore-lrg.svg#svgView) no-repeat;background-size:100%;width:152px;height:45px;margin-left:20px;image-rendering:auto')
</template>
