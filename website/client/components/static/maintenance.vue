<template lang="pug">
  .col-6.offset-3
    h1 {{ $t('habiticaBackSoon') }}
    img.img-rendering-auto.center-block.img-responsive(src='https://d2afqr2xdmyzvu.cloudfront.net/assets/scene_maintenance.png')
    p {{ $t('importantMaintenance') }}
    p(v-html="$t('twitterMaintenanceUpdates')")
    ul.lead(style='list-style-position:inside')
      li {{ $t('noDamageKeepStreaks') }}
      li {{ $t('veteranPetAward') }}
    p(v-html="$t('maintenanceMoreInfo', maintenanceMoreInfo)")
    p.lead {{ $t('thanksForPatience') }}
</template>

<script>
export default {
  data () {
    return {
      maintenanceMoreInfo: {
        linkStart: '<a href="/views/static/maintenance-info">',
        linkEnd: '</a>',
      },
    };
  },
};
</script>
