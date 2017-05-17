<template lang="pug">
.row
  .col-2.standard-sidebar
    h3 Sidebar
  .col-10.standard-page
    .clearfix
      h1.float-left.mb-0.page-header(v-once) {{ $t('items') }}
</template>

<style lang="scss" scoped>
</style>

<script>
export default {};
</script>
