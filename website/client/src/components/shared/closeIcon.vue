<template>
  <button
    title="close dialog"
    @click="$emit('click', $event)"
  >
    <div
      v-once
      class="svg-icon"
      v-html="icons.close"
    ></div>
  </button>
</template>

<script>
import svgClose from '@/assets/svg/close.svg';

export default {
  name: 'CloseIcon',
  data () {
    return {
      icons: Object.freeze({
        close: svgClose,
      }),
    };
  },
};
</script>

<style lang="scss" scoped>
  @import '~@/assets/scss/colors.scss';

  button {
    position: absolute;
    top: 1rem;
    right: 1rem;
    cursor: pointer;
    opacity: 1;

    border: 0;
    outline: 0;
    padding: 0.125rem;
    background: transparent;
    width: 1rem;
    height: 1rem;

    ::v-deep svg path {
      stroke: $gray-200;
    }

    &:hover {
      ::v-deep svg path {
        stroke: $gray-100;
      }
    }
  }
</style>
