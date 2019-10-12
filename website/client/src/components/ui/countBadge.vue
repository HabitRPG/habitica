<template>
  <span
    v-if="show && count > 0"
    class="badge badge-pill badge-item badge-count"
  >{{ count }}</span>
</template>

<style lang="scss">
@import '~@/assets/scss/colors.scss';

.badge-count {
  right: -9px;
  color: $white;
  background: $gray-200;
  padding: 4.5px 8.5px;
  min-width: 24px;
  height: 24px;
  box-shadow: 0 1px 1px 0 rgba($black, 0.12);
  z-index: 1;
}

</style>

<script>
export default {
  props: {
    show: {
      type: Boolean,
    },
    count: {
      type: Number,
    },
  },
};
</script>
