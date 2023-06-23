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
  .modal-close {
    position: absolute;
    right: 16px;
    top: 16px;
    cursor: pointer;

    .svg-close {
      width: 18px;
      height: 18px;
      vertical-align: middle;
      opacity: 0.75;

      &:hover {
        opacity: 1;
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
