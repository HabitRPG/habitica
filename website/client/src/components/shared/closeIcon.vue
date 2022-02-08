<template>
  <button
    title="close dialog"
    :style="{
      '--icon-color': iconColor,
      '--icon-color-hover': iconColorHover,
    }"
    :class="{'purple': purple}"
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
  props: ['iconColor', 'iconColorHover', 'purple'],
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

    &.purple {
      --icon-color: #{$purple-400};
      --icon-color-hover: #{$purple-500};
    }

    ::v-deep svg path {
      stroke: var(--icon-color, #{$gray-200});
    }

    &:hover {
      ::v-deep svg path {
        stroke: var(--icon-color-hover, #{$gray-100});
      }
    }
  }
</style>
