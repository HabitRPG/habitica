<template>
  <span
    v-if="show"
    class="badge badge-round badge-item badge-equip"
    :class="{'is-equipped': equipped === true}"
    @click.stop="click"
  >
    <div
      v-once
      class="svg-icon color equip-icon"
      v-html="icons.equip"
    >
    </div>
    <div
      v-once
      class="svg-icon color unequip-icon"
      v-html="icons.unEquip"
    >
    </div>
  </span>
</template>

<style lang="scss">
@import '~@/assets/scss/colors.scss';

  .badge-equip {
    cursor: pointer;
    display: none;
    left: -9px;
    color: $gray-200;
    background: $white;
    padding: 0.375rem;

    .unequip-icon {
      display: none;
    }

    &.is-equipped {
      display: block;
      background: $teal-50;
      color: $white;

      &:hover {
        .unequip-icon {
          display: block;
          color: $maroon-50;
        }

        .equip-icon {
          display: none;
        }

        background: $white;
      }
    }

    &:hover:not(.is-equipped) {
      color: $purple-400;
    }

    .svg-icon {
      width: 100%;
      height: 100%;
    }
  }

  .item:hover > .badge-equip {
    display: block;
  }
</style>

<script>
import svgEquip from '@/assets/svg/equip.svg';
import svgUnEquip from '@/assets/svg/unequip.svg';

export default {
  props: {
    show: {
      type: Boolean,
    },
    equipped: {
      type: Boolean,
    },
  },
  data () {
    return {
      icons: Object.freeze({
        equip: svgEquip,
        unEquip: svgUnEquip,
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
