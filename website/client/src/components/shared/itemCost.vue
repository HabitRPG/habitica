<template>
  <div class="item-cost">
    <span
      class="cost"
      :class="getPriceClass()"
    >
      <span
        class="svg-icon inline icon-24"
        aria-hidden="true"
        v-html="icons[getPriceClass()]"
      >
      </span>
      <span
        :class="getPriceClass()"
      >{{ item.value }}</span>
    </span>
  </div>
</template>


<style lang="scss">
  @import '~@/assets/scss/colors.scss';
  @import '~@/assets/scss/mixins.scss';

.item-cost {
 padding-bottom: 16px;
}

  .cost {
    height: 40px;
    font-size: 1.25rem;
    font-weight: bold;
    line-height: 1.4;
    vertical-align: middle;

    &.gems {
      color: $gems-color;
      border-radius: 20px;
      padding: 8px 20px 8px 20px;
      margin-top: 16px;
      margin-bottom: 16px;
      background-color: rgba(36, 204, 143, 0.15);
    }

    &.gold {
      color: $gold-color;
      border-radius: 20px;
      padding: 8px 20px 8px 20px;
      margin-top: 16px;
      margin-bottom: 16px;
      background-color: rgba(255, 190, 93, 0.15);
    }

    &.hourglasses {
      color: $hourglass-color;
      border-radius: 20px;
      padding: 8px 20px 8px 20px;
      margin-top: 16px;
      margin-bottom: 16px;
      background-color: rgba(41, 149, 205, 0.15);
    }
  }
</style>

<script>
import svgClose from '@/assets/svg/close.svg';
import svgGold from '@/assets/svg/gold.svg';
import svgGem from '@/assets/svg/gem.svg';

export default {
  data () {
    return {
      icons: Object.freeze({
        close: svgClose,
        gold: svgGold,
        gems: svgGem,
      }),
      selectedAmountToBuy: 1,
      selectedAmount: 1,
    };
  },
  methods: {
    getPriceClass () {
      if (this.priceType && this.icons[this.priceType]) {
        return this.priceType;
      } if (this.item.currency && this.icons[this.item.currency]) {
        return this.item.currency;
      }
      return 'gold';
    },
  },
};
</script>
