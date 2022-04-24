<template>
  <div
    class="customize-options"
    :class="{'background-set': fullSet}"
  >
    <div
      v-for="option in items"
      :key="option.key"
      class="outer-option-background"
      :class="{
        locked: option.gemLocked || option.goldLocked,
        premium: Boolean(option.gem),
        active: option.active || currentValue === option.key,
        none: option.none,
        hide: option.hide }"
      @click="option.click(option)"
    >
      <div class="option">
        <div
          class="sprite customize-option"
          :class="option.class"
        >
          <div
            v-if="option.none"
            class="redline-outer"
          >
            <div class="redline"></div>
          </div>
        </div>
      </div>
      <div
        v-if="option.gemLocked"
        class="gem-lock"
      >
        <div
          class="svg-icon gem"
          v-html="icons.gem"
        ></div>
        <span>{{ option.gem }}</span>
      </div>
      <div
        v-if="option.goldLocked"
        class="gold-lock"
      >
        <div
          class="svg-icon gold"
          v-html="icons.gold"
        ></div>
        <span>{{ option.gold }}</span>
      </div>
    </div>
    <div
      v-if="fullSet"
      class="purchase-set"
      @click="unlock()"
    >
      <span class="label">{{ $t('purchaseAll') }}</span>
      <div
        class="svg-icon gem"
        v-html="icons.gem"
      ></div>
      <span class="price">5</span>
    </div>
  </div>
</template>

<script>
import gem from '@/assets/svg/gem.svg';
import gold from '@/assets/svg/gold.svg';
import { avatarEditorUtilies } from '../../mixins/avatarEditUtilities';

export default {
  mixins: [
    avatarEditorUtilies,
  ],
  props: ['items', 'currentValue', 'fullSet'],
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
      height: 112px;
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

      .sprite.customize-option.shirt {
        margin-left: -3px !important;
        // otherwise its overriden by the .outer-option-background:not(.none) { rules
      }

      .sprite.customize-option.skin {
        margin-left: -8px !important;
        // otherwise its overriden by the .outer-option-background:not(.none) { rules
      }

      .option {
        border: none;
        border-radius: 2px;
        padding-left: 6px;
        padding-top: 4px;
      }

      &:hover {
        box-shadow: 0 4px 4px 0 rgba($black, 0.16), 0 1px 8px 0 rgba($black, 0.12);
        border: 1px solid $purple-500;
      }
    }

    &:not(.locked):not(.active) {
      .option:hover {
        background-color: rgba(213, 200, 255, .32);
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
        height: 60px;
        width: 60px;
        position: absolute;
        bottom: 0;
        margin: 0 auto 0 0;

        .redline {
          width: 60px;
          height: 4px;
          display: block;
          background: red;
          transform: rotate(-45deg);
          position: absolute;
          top: 0;
          margin-top: 30px;
          margin-bottom: 20px;
          margin-left: -1px;
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
    height: 64px;
    width: 64px;

    margin: 12px 8px;
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

      &.color-bangs {
        margin-top: 3px;
      }
      &.skin {
        margin-top: -4px;
        margin-left: -4px;
      }
      &.chair {
        margin-left: -1px;
        margin-top: -1px;

        &.button_chair_black {
          // different sprite margin?
          margin-top: -3px;
        }

        &.handleless {
          margin-left: -5px;
          margin-top: -5px;
        }
      }
      &.color, &.bangs {
          margin-top: 4px;
          margin-left: -3px;
      }

      &.hair.base {
          margin-top: 0px;
          margin-left: -5px;
      }

      &.headAccessory {
        margin-top: 0;
        margin-left: -4px;
      }

      &.headband {
        margin-top: -6px;
        margin-left: -27px;
      }
    }
  }

  .text-center {
    .gem-lock, .gold-lock {
      display: inline-block;
      margin: 0 auto 8px;
      vertical-align: bottom;
    }
  }

  .gem-lock, .gold-lock {
    .svg-icon {
      width: 16px;
    }

    span {
      font-weight: bold;
      margin-left: .5em;
    }

    .svg-icon, span {
      display: inline-block;
      vertical-align: bottom;
    }
  }

  .gem-lock span {
    color: $green-10
  }

  .purchase-set {
    background: #fff;
    padding: 0.5em;
    border-radius: 0 0 2px 2px;
    box-shadow: 0 2px 2px 0 rgba(26, 24, 29, 0.16), 0 1px 4px 0 rgba(26, 24, 29, 0.12);
    cursor: pointer;

    span {
      font-weight: bold;
      font-size: 12px;
    }

    span.price {
      color: #24cc8f;
    }

    .gem, .coin {
      width: 16px;
    }

    &.single {
      width: 141px;
    }

    width: 100%;

    span {
      font-size: 14px;
    }

    .gem, .coin {
      width: 20px;
      margin: 0 .5em;
      display: inline-block;
      vertical-align: bottom;
    }
  }

  .background-set {
    background-color: #edecee;
    border-radius: 2px;

    padding-top: 12px;
    margin-left: 12px;
    margin-right: 12px;
    margin-bottom: 12px;

    width: calc(100% - 24px);

    padding-left: 0;
    padding-right: 0;

    max-width: unset; // disable col12 styling
    flex: unset;
  }

</style>
