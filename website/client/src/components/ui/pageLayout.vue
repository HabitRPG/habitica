<template lang="pug">
.row
  .standard-sidebar.d-none.d-sm-block(v-if="showSidebar")
    slot(name="sidebar")
  .standard-page
    slot(name="page")
</template>

<script>
    export default {
      props: {
        showSidebar: {
          type: Boolean,
          default: true,
        },
      },
    };
</script>

<style scoped lang="scss">

    .standard-page {
      position: relative;
    }
</style>
