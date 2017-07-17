<template lang='pug'>
  h1 {{ $t('habiticaBackSoon') }}
  img.img-rendering-auto.center-block.img-responsive(src='https://d2afqr2xdmyzvu.cloudfront.net/assets/scene_maintenance.png')
  p! {{ $t('importantMaintenance') }}
  p! {{ $t('twitterMaintenanceUpdates') }}
  ul.lead(style='list-style-position:inside')
    li {{ $t('noDamageKeepStreaks') }}
    li {{ $t('veteranPetAward') }}
  p!=t('maintenanceMoreInfo', {linkStart: '<a href="/views/static/maintenance-info">', linkEnd: '</a>',})
  p.lead {{ $t('thanksForPatience') }}
</template>
