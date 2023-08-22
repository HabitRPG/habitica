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
    color: $black;
    position: absolute;
    right: 16px;
    top: 16px;
    cursor: pointer;

    .svg-close {
      width: 18px;
      height: 18px;
      vertical-align: middle;
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
