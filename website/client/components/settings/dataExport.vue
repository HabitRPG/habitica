<template lang="pug">
.row
  .col-md-6
    h2 {{ $t('dataExport') }}
    small {{ $t('saveData') }}
    h4 {{ $t('habitHistory') }}
    | {{ $t('exportHistory') }}
    a(href="/export/history.csv") {{ $t('csv') }}
    h4 {{ $t('userData') }}
    | {{ $t('exportUserData') }}
    a(href="/export/userdata.xml") {{ $t('xml') }}
    a(href="/export/userdata.json") {{ $t('json') }}
</template>
