<template>
  <div class="d-flex align-items-center">
    <div
      v-for="currency of currencies"
      :key="currency.key"
      class="d-flex align-items-center"
    >
      <div
        class="svg-icon icon-16 ml-1"
        v-html="currency.icon"
      ></div>
      <div
        :class="{'notEnough': currency.notEnough}"
        class="currency-value mx-1 my-auto"
      >
        {{ currency.value | roundBigNumber }}
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
  @import '~@/assets/scss/colors.scss';

  .currency-value {
    font-size: 0.75rem;
    line-height: 1.33;
    color: $gray-100;
    display: inline-block;
  }

  .notEnough {
    color: #f23035 !important;
  }

  .svg-icon {
    margin-top: 1px;
  }
</style>

<script>
import svgGem from '@/assets/svg/gem.svg';
import svgGold from '@/assets/svg/gold.svg';
import svgHourglasses from '@/assets/svg/hourglass.svg';

import currencyMixin from './_currencyMixin';

export default {
  mixins: [currencyMixin],
  props: {
    currencyNeeded: {
      type: String,
    },
    amountNeeded: {
      type: Number,
    },
  },
  data () {
    return {
      icons: Object.freeze({
        gem: svgGem,
        gold: svgGold,
        hourglasses: svgHourglasses,
      }),
    };
  },
  computed: {
    currencies () {
      const currencies = [];
      currencies.push({
        type: 'hourglasses',
        icon: this.icons.hourglasses,
        value: this.userHourglasses,
      });

      currencies.push({
        type: 'gems',
        icon: this.icons.gem,
        value: this.userGems,
      });

      currencies.push({
        type: 'gold',
        icon: this.icons.gold,
        value: this.userGold,
      });

      for (const currency of currencies) {
        if (
          currency.type === this.currencyNeeded
          && !this.enoughCurrency(this.currencyNeeded, this.amountNeeded)
        ) {
          currency.notEnough = true;
        }
      }

      return currencies;
    },
  },
};
</script>
