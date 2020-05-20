<template>
  <span
    v-if="show"
    class="badge badge-round badge-item badge-star"
    :class="{'item-selected-badge': selected === true}"
    @click.stop="click"
  >
    <div
      class="svg-icon color"
      v-html="icons.star"
    >
    </div>
  </span>
</template>

<style lang="scss">
@import '~@/assets/scss/colors.scss';

  .badge-star {
    cursor: pointer;
    display: none;
    left: -9px;
    color: $gray-400;
    background: $white;
    padding: 0.375rem;

    &.item-selected-badge {
      display: block;
      background: $teal-50;
      color: $white;
    }

    &:hover:not(.item-selected-badge) {
      color: $purple-300;
    }

    .svg-icon {
      width: 100%;
      height: 100%;
    }
  }

  .item:hover > .badge-star {
    display: block;
  }
</style>

<script>
import svgStar from '@/assets/svg/star-badge.svg';

export default {
  props: {
    show: {
      type: Boolean,
    },
    selected: {
      type: Boolean,
    },
  },
  data () {
    return {
      icons: Object.freeze({
        star: svgStar,
      }),
    };
  },
  methods: {
    click () {
      this.$emit('click');
    },
  },
};
</script>
