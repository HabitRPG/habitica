<template>
  <span
    v-if="show && count > 0"
    class="badge badge-pill badge-item badge-count d-flex justify-content-center align-items-center"
  >{{ count }}</span>
</template>

<style lang="scss">
@import '~@/assets/scss/colors.scss';

.badge-count {
  right: -9px;
  top: -12px;
  border-radius: 100px;
  color: $white;
  background: $gray-200;
  padding: 4.5px 8.5px;
  min-width: 1.5rem;
  height: 1.5rem;
  z-index: 1;
  user-select: none;
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
