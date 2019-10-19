<template>
  <div class="row">
    <div
      v-if="showSidebar"
      class="standard-sidebar d-none d-sm-block"
    >
      <slot name="sidebar"></slot>
    </div>
    <div class="standard-page">
      <slot name="page"></slot>
    </div>
  </div>
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
