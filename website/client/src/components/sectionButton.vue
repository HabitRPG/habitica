<template>
  <div
    class="toggle ml-auto section-button"
    role="button"
    :aria-expanded="visible"
    tabindex="0"
    @keyup.enter="emitClick"
    @click="emitClick"
  >
    <span
      v-if="visible"
      class="svg-icon icon-16"
      v-html="icons.upIcon"
    ></span>
    <span
      v-else
      class="svg-icon icon-16 down-icon color-stroke"
      v-html="icons.downIcon"
    ></span>
  </div>
</template>

<style lang="scss" scoped>
  @import '~@/assets/scss/colors.scss';

  .toggle {
    border: 0;
    background: transparent;
    cursor: pointer;
    &:focus {
      // Fix keyboard inaccessible https://github.com/HabitRPG/habitica/pull/12656
      outline: none;
      border: $purple-400 solid 1px;
    }
  }

  .svg-icon {
    display: flex;

    ::v-deep svg {
      height: 100%;
    }
  }

  .down-icon {
    color: $gray-300;
  }
</style>

<script>
import upIcon from '@/assets/svg/up.svg';
import downIcon from '@/assets/svg/down.svg';

export default {
  props: {
    visible: {
      required: true,
    },
  },
  data () {
    return {
      icons: {
        upIcon,
        downIcon,
      },
    };
  },
  methods: {
    emitClick ($event) {
      if ($event.stopPropagation) {
        $event.stopPropagation();
      }

      this.$emit('click');
    },
  },
};
</script>
