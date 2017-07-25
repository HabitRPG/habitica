<template lang="pug">
  .container
    h1.text-center {{ $t('maintenanceInfoTitle') }}
    img.img-rendering-auto.center-block.img-responsive(src='https://d2afqr2xdmyzvu.cloudfront.net/assets/scene_maintenance.png')
    h2 {{ $t('maintenanceInfoWhat') }}
    p(v-html="$t('maintenanceInfoWhatText')")

    img.pull-left(src='https://d2afqr2xdmyzvu.cloudfront.net/assets/scene_new.png')
    h2 {{ $t('maintenanceInfoWhy') }}
    p {{ $t('maintenanceInfoWhyText') }}
    p(v-html="$t('maintenanceInfoTechDetails')")

    h2 {{ $t('maintenanceInfoMore') }}
    h3 {{ $t('maintenanceInfoAccountChanges') }}
    p(v-html="$t('maintenanceInfoAccountChangesText', { hrefTechAssistanceEmail })")
    h3 {{ $t('maintenanceInfoAddFeatures') }}
    p {{ $t('maintenanceInfoAddFeaturesText') }}
    h3 {{ $t('maintenanceInfoHowLong') }}

    img.pull-right(src='https://d2afqr2xdmyzvu.cloudfront.net/assets/scene_chatter.png')
    p(v-html="$t('maintenanceInfoHowLongText')")
    h3 {{ $t('maintenanceInfoStatsAffected') }}
    p {{$t('maintenanceInfoStatsAffectedText1')}}
    p {{$t('maintenanceInfoStatsAffectedText2')}}
    h3 {{ $t('maintenanceInfoSeeTasks') }}
    p {{ $t('maintenanceInfoSeeTasksText') }}
    h3 {{ $t('maintenanceInfoRarePet') }}
    p {{ $t('maintenanceInfoRarePetText') }}
    img.pull-left(src='https://d2afqr2xdmyzvu.cloudfront.net/assets/scene_coding.png')
    h3 {{ $t('maintenanceInfoWho') }}
    p {{ $t('maintenanceInfoWhoText') }}
    p {{ $t('maintenanceInfoTesting') }}
</template>

<script>
// @TODO: EMAILS.TECH_ASSISTANCE_EMAIL
const TECH_ASSISTANCE_EMAIL = 'admin@habitica.com';

export default {
  data () {
    return {
      hrefTechAssistanceEmail: `<a href="mailto:${TECH_ASSISTANCE_EMAIL}">${TECH_ASSISTANCE_EMAIL}</a>`,
    };
  },
};
</script>
