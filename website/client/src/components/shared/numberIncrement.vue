<template>
  <div class="d-flex flex-row align-items-center justify-content-center number-increment">
    <!-- negative -->
    <!-- buy modal -->
    <div
      v-if="buy-modal"
    >
      <div
        class="gray-circle"
        @click="selectedAmountToBuy--"
        @keyup.native="preventNegative($event)"
      >
        <div
          class="icon-negative"
          v-html="icons.svgNegative"
        ></div>
      </div>
      <div class="input-group">
        <div class="align-items-center">
        </div>
        <input
          v-model="selectedAmountToBuy"
          class="form-control alignment"
          min="0"
          step="1"
          max="maxItemsToBuy"
        >
      </div>
      <div
        class="gray-circle"
        @keyup="selectedAmountToBuy++"
      >
        <div
          class="icon-positive"
          v-html="icons.svgPositive"
        ></div>
      </div>
    </div>
    <!-- sell modal -->
    <div
      v-else-if="sell-modal"
    >
      <div
        class="gray-circle"
        @click="selectedAmountToSell--"
        @keyup.native="preventNegative($event)"
      >
        <div
          class="icon-negative"
          v-html="icons.svgNegative"
        ></div>
      </div>
      <div class="input-group">
        <div class="align-items-center">
        </div>
        <input
          v-model="selectedAmountToSell"
          class="form-control alignment"
          min="0"
          step="1"
          max="maxItemsToBuy"
        >
      </div>
      <div
        v-if="buy-modal"
        class="gray-circle"
        @click="selectedAmountToSell++"
      >
        <div
          class="icon-positive"
          v-html="icons.svgPositive"
        ></div>
      </div>
    </div>
    <!-- buy quest modal -->
    <div
      v-else-if="buy-quest-modal"
    >
      <div
        class="gray-circle"
        @click="selectedAmountToBuy--"
        @keyup.native="preventNegative($event)"
      >
        <div
          class="icon-negative"
          v-html="icons.svgNegative"
        ></div>
      </div>
      <div class="input-group">
        <div class="align-items-center">
        </div>
        <input
          v-model="selectedAmountToBuy"
          class="form-control alignment"
          min="0"
          step="1"
          max="maxItemsToBuy"
        >
      </div>
      <div
        class="gray-circle"
        @keyup="selectedAmountToBuy++"
      >
        <div
          class="icon-positive"
          v-html="icons.svgPositive"
        ></div>
      </div>
    </div>
    <!-- gifting modal -->
    <div
      v-else-if="send-gift"
    >
      <div
        class="gray-circle"
        @click="gift.gems.amount--"
        @keyup.native="preventNegative($event)"
      >
        <div
          class="icon-negative"
          v-html="icons.svgNegative"
        ></div>
      </div>
      <div class="input-group">
        <div class="align-items-center">
        </div>
        <input
          v-model="selectedAmountToBuy"
          class="form-control alignment"
          min="0"
          step="1"
          max="maxGems"
        >
      </div>
      <div
        class="gray-circle"
        @click="gift.gems.amount++"
      >
        <div
          class="icon-positive"
          v-html="icons.svgPositive"
        ></div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
  @import '~@/assets/scss/colors.scss';

  .number-increment {
    padding-bottom: 12px;
    }

  .alignment {
    text-align: center;
  }

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
import svgGem from '@/assets/svg/gem.svg';
import svgGold from '@/assets/svg/gold.svg';
import svgPositive from '@/assets/svg/positive.svg';
import svgNegative from '@/assets/svg/negative.svg';

// modules
// import keys from 'lodash/keys';

import { mapState } from '@/libs/store';

const hideAmountSelectionForPurchaseTypes = [
  'gear', 'backgrounds', 'mystery_set', 'card',
  'rebirth_orb', 'fortify', 'armoire', 'keys',
  'debuffPotion', 'pets', 'mounts',
];

export default {
  data () {
    return {
      icons: Object.freeze({
        svgGem,
        svgGold,
        svgPositive,
        svgNegative,
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
    fromBal () {
      return this.gift.type === 'gems' && this.gift.gems.fromBalance;
    },
    maxGems () {
      const maxGems = this.fromBal ? this.userLoggedIn.balance * 4 : 9999;
      return maxGems;
    },
    getPriceClass () {
      if (this.priceType && this.icons[this.priceType]) {
        return this.priceType;
      } if (this.item.currency && this.icons[this.item.currency]) {
        return this.item.currency;
      }
      return 'gold';
    },
    showAmountToBuy (item) {
      if (hideAmountSelectionForPurchaseTypes.includes(item.purchaseType)) {
        return false;
      } return true;
    },
  },
  methods: {
    preventNegative ($event) {
      const { value } = $event.target;

      if (Number(value) < 0) {
        this.selectedAmountToSell = 0;
      }
    },
  },
};

</script>
