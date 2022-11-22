<template>
  <div class="d-flex flex-row align-items-center justify-content-center">
    <!-- negative -->
    <div
      v-if="buy-modal"
      class="gray-circle"
      @click="selectedAmountToBuy <= 0
        ? selectedAmountToBuy = 0
        : selectedAmountToBuy--"
    >
      <div
        class="icon-negative"
        v-html="icons.negative"
      ></div>
    </div>
    <div
      v-else-if="sell-modal"
      class="gray-circle"
      @click="selectedAmountToSell <= 0
        ? selectedAmountToSell = 0
        : selectedAmountToSell--"
    >
      <div
        class="icon-negative"
        v-html="icons.negative"
      ></div>
    </div>
    <div
      v-else
      class="gray-circle"
      @click="gift.gems.amount <= 0
        ? gift.gems.amount = 0
        : gift.gems.amount--"
    >
      <div
        class="icon-negative"
        v-html="icons.negative"
      ></div>
    </div>
    <!-- quantity -->
    <div class="input-group">
      <div class="input-group-prepend input-group-icon align-items-center">
        <div
          v-if="send-gift"
          class="icon-gem"
          v-html="icons.gem"
        ></div>
        <div
          v-else
        >
        </div>
      </div>
      <input
        id="gemsForm"
        v-model.number="variable"
        class="form-control"
        min="1"
      >
    </div>
    <!-- positive -->
    <div
      v-if="buy-modal"
      class="gray-circle"
      @click="selectedAmountToBuy++"
    >
      <div
        class="icon-positive"
        v-html="icons.positive"
      ></div>
    </div>
    <div
      v-else-if="sell-modal"
      class="gray-circle"
      @click="selectedAmountToSell++"
    >
      <div
        class="icon-positive"
        v-html="icons.positive"
      ></div>
    </div>
    <div
      v-else
      class="gray-circle"
      @click="gift.gems.amount++"
    >
      <div
        class="icon-positive"
        v-html="icons.positive"
      ></div>
    </div>
  </div>
</template>

<style scoped lang="scss">
  @import '~@/assets/scss/colors.scss';

  label {
    color: $gray-50;
    font-size: 0.875rem;
    font-weight: bold;
    line-height: 1.71;
    margin: 12px 0 16px 0;
    width: 100%;
    text-align: center;
  }

  .input-group {
    width: 94px;
    height: 32px;
    margin: 0px 16px 0px 16px;
    padding: 0;
    border-radius: 2px;
    border: solid 1px $gray-400;
    background-color: $white;
  }

  .gray-circle {
    border-radius: 100%;
    border: solid 2px $gray-300;
    width: 32px;
    height: 32px;
    cursor: pointer;

    &:hover {
      border-color: $purple-400;
    }
  }

  .gray-circle:hover{
    .icon-positive, .icon-negative {
      & ::v-deep svg path {
        fill: $purple-400;
      }
    }
  }

  .icon-gem {
    width: 16px;
    height: 16px;
    margin-bottom: 4px;
  }

  .icon-positive, .icon-negative {
    width: 10px;
    height: 10px;
    margin: 4px auto;

    & ::v-deep svg path {
      fill: $gray-300;
    }
  }
</style>

<script>
// icons
import gemIcon from '@/assets/svg/gem.svg';
import goldIcon from '@/assets/svg/gold.svg';
import positiveIcon from '@/assets/svg/positive.svg';
import negativeIcon from '@/assets/svg/negative.svg';

// modules
// import keys from 'lodash/keys';

import { mapState } from '@/libs/store';

export default {
  data () {
    return {
      icons: Object.freeze({
        gold: gemIcon,
        gem: goldIcon,
        plus: positiveIcon,
        minus: negativeIcon,
      }),
      selectedAmountToBuy: 1,
      selectedAmountToSell: 1,
      gift: {
        type: 'gems',
        gems: {
          amount: 0,
          fromBalance: true,
        },
      },
      gemCost: 1,
    };
  },
  computed: {
    ...mapState({ user: 'user.data' }), // might not need this?
    notEnoughCurrency () {
      const notEnoughCurrency = !this.enoughCurrency(this.getPriceClass(),
        this.item.value * this.selectedAmountToBuy);
      return notEnoughCurrency;
    },
    userGold () {
      const userGold = this.user.currency;
      return userGold;
    },
    maxItemsToBuy () {
      const maxItemsToBuy = this.userGold
        ? this.userGold / this.item.currency
        : this.notEnoughCurrency;
      return maxItemsToBuy;
    },

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
