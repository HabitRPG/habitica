<template>
  <div class="row">
    <div class="col-md-6">
      <h2>{{ $t('dataExport') }}</h2>
      <small>{{ $t('saveData') }}</small>
      <h4>{{ $t('habitHistory') }}</h4>
      {{ $t('exportHistory') }}
      <a href="/export/history.csv">{{ $t('csv') }}</a>
      <h4>{{ $t('userData') }}</h4>
      {{ $t('exportUserData') }}
      <a href="/export/userdata.xml">{{ $t('xml') }}</a>
      <a href="/export/userdata.json">{{ $t('json') }}</a>
    </div>
  </div>
</template>

<script>
export default {
  mounted () {
    this.$store.dispatch('common:setTitle', {
      section: this.$t('settings'),
      subSection: this.$t('dataExport'),
    });
  },
};
</script>
