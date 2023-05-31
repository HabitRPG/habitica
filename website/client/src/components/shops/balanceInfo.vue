<template>
  <div class="d-flex justify-content-around">
    <span
      v-for="currency of currencies"
      :key="currency.key"
    >
      <div
        class="svg-icon ml-1"
        v-html="currency.icon"
      ></div>
      <span
        :class="{'notEnough': currency.notEnough}"
        class="mx-1"
      >
        {{ currency.value | roundBigNumber }}
      </span>
    </span>
  </div>
</template>

<style lang="scss" scoped>
  @import '~@/assets/scss/colors.scss';

span {
  font-size: 0.75rem;
  line-height: 1.33;
  color: $gray-100;
  margin-bottom: 16px;
  margin-top: -4px;

  display: inline-block;
}

.svg-icon {
  vertical-align: middle;
  width: 16px;
  height: 16px;
  display: inline-block;
}

  .notEnough {
    color: #f23035 !important;
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
