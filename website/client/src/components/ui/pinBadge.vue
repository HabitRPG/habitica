<template>
  <div
    class="badge badge-round badge-pin align-items-center justify-content-center"
    :class="{'pinned': pinned}"
  >
    <div
      class="svg-icon color"
      v-html="icons.pin"
    >
    </div>
  </div>
</template>

<style lang="scss" scoped>
@import '@/assets/scss/colors.scss';

  .badge-pin {
    background-color: $white;
    color: $gray-100;
    transition: none;
    display: flex;
    cursor: pointer;
    padding: 0.25rem;

    &:hover:not(.pinned) {
      color: $purple-300;
    }

    &.pinned {
      background-color: $purple-300;
      color: $white;
    }

    .svg-icon {
      width: 16px;
      height: 16px;
    }
  }

</style>

<script>
import svgPin from '@/assets/svg/pin.svg?raw';

export default {
  props: {
    pinned: {
      type: Boolean,
    },
  },
  data () {
    return {
      icons: Object.freeze({
        pin: svgPin,
      }),
    };
  },
};
</script>
