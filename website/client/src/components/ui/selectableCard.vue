<template>
  <div
    class="selectable-card"
    :class="{ selected }"
    @click="$emit('click')"
  >
    <div
      v-if="selected"
      class="checkmark-corner"
    >
      <div
        class="svg-icon check-icon"
        v-html="icons.check"
      ></div>
    </div>
    <slot></slot>
  </div>
</template>

<style lang="scss" scoped>
@import '@/assets/scss/colors.scss';

.selectable-card {
  position: relative;
  background: $white;
  border: 1px solid $gray-400;
  border-radius: 8px;
  padding: 16px;
  cursor: pointer;
  box-shadow: 0px 1px 2px 0px rgba(26, 24, 29, 0.08);

  &:hover {
    box-shadow: 0px 3px 6px 0px rgba(26, 24, 29, 0.16), 0px 3px 6px 0px rgba(26, 24, 29, 0.24);
  }

  &.selected {
    border: 2px solid $purple-300;
    padding: 15px;
    box-shadow: 0px 3px 6px 0px rgba(26, 24, 29, 0.16), 0px 3px 6px 0px rgba(26, 24, 29, 0.24);
  }
}

.checkmark-corner {
  position: absolute;
  top: 0;
  left: 0;
  width: 48px;
  height: 48px;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    border-style: solid;
    border-width: 48px 48px 0 0;
    border-color: $purple-300 transparent transparent transparent;
    border-radius: 6px 0 0 0;
  }

  .check-icon {
    position: absolute;
    top: 8px;
    left: 8px;
    width: 16px;
    height: 16px;
    color: $white;
  }
}
</style>

<script>
import svgCheck from '@/assets/svg/check.svg?raw';

export default {
  props: {
    selected: {
      type: Boolean,
      default: false,
    },
  },
  emits: ['click'],
  data () {
    return {
      icons: Object.freeze({
        check: svgCheck,
      }),
    };
  },
};
</script>
