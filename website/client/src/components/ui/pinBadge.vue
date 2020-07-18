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
@import '~@/assets/scss/colors.scss';

  .badge-pin {
    background-color: $white;
    color: $gray-200;
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
      width: 100%;
      height: 100%;
    }
  }

</style>

<script>
import svgPin from '@/assets/svg/pin.svg';

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
