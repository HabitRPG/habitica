<template>
  <div
    class="modal-close"
    @click="$emit('close')"
  >
    <div
      class="svg-icon svg-close color"
      v-html="icons.close"
    >
    </div>
  </div>
</template>

<style lang="scss" scoped>
@import '~@/assets/scss/colors.scss';

  .modal-close {
    position: absolute;
    right: 16px;
    top: 16px;
    cursor: pointer;

    .svg-close {
      color: $gray-50;
      width: 18px;
      height: 18px;
      opacity: 0.5;

      &:hover {
        opacity: 0.75;
      }
    }
  }
</style>

<script>
import close from '@/assets/svg/close.svg';

export default {
  data () {
    return {
      icons: Object.freeze({
        close,
      }),
    };
  },
};
</script>
