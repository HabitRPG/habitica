<template>
  <div
    v-if="items.length > 1"
    class="customize-options mb-4"
  >
    <div
      v-for="option in items"
      :key="option.key"
      :id="option.imageName"
      class="outer-option-background"
      :class="{
        premium: Boolean(option.gem),
        active: option.active || currentValue === option.key,
        none: option.none,
        hide: option.hide }"
      @click="option.click(option)"
    >
      <b-popover
        :target="option.imageName"
        triggers="hover focus"
        placement="bottom"
        :prevent-overflow="false"
      >
        <strong> {{ option.text }} </strong>
      </b-popover>
      <div class="option">
        <Sprite
          v-if="!option.none"
          class="sprite"
          :prefix="option.isGear ? 'shop' : 'icon'"
          :imageName="option.imageName"
          :image-name="option.imageName"
        />
          <div
            v-else
            class="redline-outer"
          >
            <div class="redline"></div>
          </div>
      </div>
    </div>
  </div>
</template>

<script>
import gem from '@/assets/svg/gem.svg';
import gold from '@/assets/svg/gold.svg';
import { avatarEditorUtilities } from '../../mixins/avatarEditUtilities';
import Sprite from '@/components/ui/sprite.vue';

export default {
  components: {
    Sprite,
  },
  mixins: [
    avatarEditorUtilities,
  ],
  props: ['items', 'currentValue'],
  data () {
    return {
      icons: Object.freeze({
        gem,
        gold,
      }),
    };
  },
  methods: {
    unlock () {
      this.$emit('unlock');
    },
  },
};
</script>

<style lang="scss" scoped>
  @import '~@/assets/scss/colors.scss';

  .customize-options {
    width: 100%;
  }

  .hide {
    display: none !important;
  }

  .outer-option-background {
    display: inline-block;
    vertical-align: top;
    pointer-events: visible;
    cursor: pointer;

    &.premium {
      height: 120px;
      width: 96px;
      margin-left: 8px;
      margin-right: 8px;
      margin-bottom: 8px;

      .option {
        margin: 12px 16px;
      }
    }

    &.locked {
      border-radius: 2px;
      border: 1px solid transparent;
      box-shadow: 0 2px 2px 0 rgba(26, 24, 29, 0.16), 0 1px 4px 0 rgba(26, 24, 29, 0.12);
      background-color: $white;

      .option {
        border: none;
        border-radius: 2px;
      }

      &:hover {
        box-shadow: 0 4px 4px 0 rgba($black, 0.16), 0 1px 8px 0 rgba($black, 0.12);
        border: 1px solid $purple-500;
      }
    }

    &:not(.locked):not(.active) {
      .option:hover {
        background-color: rgba($purple-300, .25);
      }
    }

    &.premium:not(.locked):not(.active) {
      border-radius: 2px;
      background-color: rgba(59, 202, 215, 0.1);
    }

    &.none .option {
      .sprite {
        opacity: 0.24;
      }

      .redline-outer {
        height: 68px;
        width: 68px;
        position: absolute;
        bottom: 0;
        margin: 0 auto 0 0;

        .redline {
          width: 68px;
          height: 4px;
          display: block;
          background: red;
          transform: rotate(-45deg);
          position: absolute;
          top: 0;
          margin-top: 30px;
          margin-bottom: 20px;
        }
      }
    }

    &.active .option {
      background: white;
      border: solid 4px $purple-300;
    }

    &.premium:not(.active) .option {
      border-radius: 8px;
    }
  }
  .option {
    vertical-align: bottom;
    height: 76px;
    width: 76px;

    border: 4px solid transparent;
    border-radius: 10px;
    position: relative;

    &:hover {
      cursor: pointer;
    }
  }

  .outer-option-background:not(.none) {

    .sprite.customize-option {
      margin-top: 0;
      margin-left: 0;
    }
  }
</style>
