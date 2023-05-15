<template>
  <b-modal
    id="sell-modal"
    :hide-header="true"
    @change="onChange($event)"
  >
    <div>
      <span
        class="svg-icon close-icon icon-16 color"
        aria-hidden="true"
        @click="hideDialog()"
        v-html="icons.close"
      ></span>
    </div>
    <div
      v-if="item"
      class="content bordered-item"
    >
      <div class="inner-content">
        <item
          class="flat bordered-item"
          :item="item"
          :item-content-class="itemContextToSell.itemClass"
          :show-popover="false"
        />
        <span class="owned">
          {{ $t('owned') }}: <span class="user-amount">{{ itemContextToSell.itemCount }}</span>
        </span>
        <h4 class="title">
          {{ itemContextToSell.itemName }}
        </h4>
        <div v-if="item.key === 'Saddle'">
          <div class="item-notes">
            {{ item.sellWarningNote() }}
          </div>
          <br>
        </div>
        <div v-else>
          <div>
            <div class="item-notes">
              {{ item.notes() }}
            </div>
            <div class="item-cost">
              <span class="cost gold">
                <span
                  class="svg-icon inline icon-24"
                  aria-hidden="true"
                  v-html="icons.gold"
                ></span>
                <span>{{ item.value }}</span>
              </span>
            </div>
            <div>
              <span
                class="how-many-to-sell"
              >
                {{ $t('howManyToSell') }}
              </span>
            </div>
            <div>
              <number-increment
                @updateQuantity="selectedAmountToSell = $event"
              />
            </div>
            <div class="total-row">
              <span class="total-text">
                {{ $t('sendTotal') }}
              </span>
              <span
                class="svg-icon total icon-24"
                aria-hidden="true"
                v-html="icons.gold"
              ></span>
              <span class="total-text gold">
                {{ item.value * selectedAmountToSell }}
              </span>
            </div>
            <button
              class="btn btn-primary"
              :disabled="selectedAmountToSell > itemContextToSell.itemCount"
              @click="sellItems()"
            >
              {{ $t('sellItems') }}
            </button>
          </div>
        </div>
      </div>
    </div>
    <div
      slot="modal-footer"
      class="clearfix"
    >
      <span class="user-balance float-left">{{ $t('yourBalance') }}</span>
      <balanceInfo
        class="float-right currency-totals"
      />
    </div>
  </b-modal>
</template>
<style lang="scss">
  @import '~@/assets/scss/colors.scss';
  @import '~@/assets/scss/mixins.scss';

  #sell-modal {
    @include centeredModal();

    .itemsToSell {
      display: inline-block;
      width: 5em;
    }

    .modal-dialog {
      width: 448px;
    }

    .modal-body {
      padding-left: 0px;
      padding-right: 0px;
      padding-bottom: 0px;
    }

    .modal-footer {
      height: 48px;
      background-color: $gray-700;
      border-bottom-right-radius: 8px;
      border-bottom-left-radius: 8px;
      display: block;
      margin: 24px 0 0;
      padding: 16px 24px;
      align-content: center;

      .user-balance {
        width: 150px;
        height: 16px;
        font-size: 0.75rem;
        font-weight: bold;
        line-height: 1.33;
        color: $gray-100;
        margin-bottom: 16px;
        margin-top: -4px;
        margin-left: -4px;
      }

      .currency-totals {
        margin-right: -8px;
        float: right;
      }
    }

    .content {
      text-align: center;
    }

    .inner-content {
      margin: 33px auto auto;
      width: 282px;
    }

    .owned {
      font-size: 0.75rem;
      font-weight: bold;
      line-height: 1.33;
      background-color: $gray-600;
      padding: 8px 8px;
      border-bottom-right-radius: 4px;
      border-bottom-left-radius: 4px;
      display: block;
      width: 141px;
      margin-left: 71px;
      margin-top: -48px;
      position: relative;
      z-index: 1;

      .user-amount {
        font-weight: normal !important;
      }
    }

    .item-wrapper {
      margin-top: -10px;
    }

    .item {
      width: 141px;
      height: 147px;
      border-top-left-radius: 4px;
      border-top-right-radius: 4px;
      border-bottom-right-radius: 0px;
      border-bottom-left-radius: 0px;
      cursor: default;
      margin-top: 8px;
    }

    .item-content {
      transform: scale(1.45, 1.45);
      top: -25px;
      left: 1px;
    }

    .title {
      color: $gray-10;
      font-size: 1.25rem;
      margin-top: 26px;
      margin-bottom: 0px;
    }

    .item-notes {
       margin-top: 12px;
       line-height: 1.71;
       font-size: 0.875rem;
    }

// for cost icon of a single item
    span.svg-icon.inline.icon-24 {
      display: inline-block;
      height: 24px;
      width: 24px;
      margin-right: 4px;
      padding-top: 4px;
    }
// for the total user cost
    span.svg-icon.total.icon-24 {
      display: inline-block;
      height: 24px;
      width: 24px;
      margin-left: 6px;
      margin-right: 8px;
      padding-top: 6px;
    }

    span.svg-icon.icon-16 {
      height: 16px;
      width: 16px;
    }

    .close-icon {
      color: $gray-200;
      stroke-width: 0px;
      cursor: pointer;

      &:hover {
        color: $gray-100;
      }
    }

  .item-cost {
      display: inline-flex;
      margin: 16px 0;
      align-items: center;
      height: 40px;
    }

    .cost {
      display: inline-block;
      font-family: sans-serif;
      font-size: 1.25rem;
      font-weight: bold;
      padding: 6px 20px;
      line-height: 1.4;
      border-radius: 20px;

      &.gold {
        color: $yellow-5;
        background-color: rgba(255, 190, 93, 0.15);
        align-items: center;
      }
    }
  }

  .how-many-to-sell {
    font-weight: bold !important;
  }

  .number-increment {
     margin-top: 16px;
  }

  .total-row {
    font-weight: bold;
    font-size: 0.875rem;
    margin-top: 16px;

    &.gold {
      color: $yellow-5;
    }
  }

    .total-text {
      color: $gray-50;
      font-weight: bold;
      font-size: 0.875rem;
      line-height: 1.71;

    &.gold {
      color: $yellow-5;
    }
  }

  button.btn.btn-primary {
    margin-top: 16px;
    padding: 4px 16px;
    height: 32px;

    &:focus {
      border: 2px solid black;
    }

  .balance {
    width: 74px;
    height: 16px;
    font-size: 12px;
    font-weight: bold;
    line-height: 1.33;
    color: $gray-200;
  }


}
</style>

<script>
import svgClose from '@/assets/svg/close.svg';
import svgGold from '@/assets/svg/gold.svg';
import svgGem from '@/assets/svg/gem.svg';
import svgPositive from '@/assets/svg/positive.svg';
import svgNegative from '@/assets/svg/negative.svg';

import BalanceInfo from '../balanceInfo.vue';
import Item from '@/components/inventory/item';
import numberIncrement from '@/components/shared/numberIncrement';

export default {
  components: {
    BalanceInfo,
    Item,
    numberIncrement,
  },
  data () {
    return {
      selectedAmountToSell: 1,
      itemContextToSell: null,

      icons: Object.freeze({
        close: svgClose,
        gold: svgGold,
        gem: svgGem,
        svgPositive,
        svgNegative,
      }),
    };
  },
  computed: {
    item () {
      return this.itemContextToSell && this.itemContextToSell.item;
    },
  },
  mounted () {
    this.$root.$on('sellItem', itemCtx => {
      this.itemContextToSell = itemCtx;
      this.$root.$emit('bv::show::modal', 'sell-modal');
    });
  },
  beforeDestroy () {
    this.$root.$off('sellItem');
  },
  methods: {
    onChange ($event) {
      this.$emit('change', $event);

      this.selectedAmountToSell = 1;
    },
    preventNegative ($event) {
      const { value } = $event.target;

      if (Number(value) < 0) {
        this.selectedAmountToSell = 0;
      }
    },
    maxOwned () {
      const maxOwned = this.itemContextToSell.itemCount;
      return maxOwned;
    },
    sellItems () {
      if (!Number.isInteger(Number(this.selectedAmountToSell))) {
        this.selectedAmountToSell = 0;
        return;
      }

      this.$store.dispatch('shops:sellItems', {
        type: this.itemContextToSell.itemType,
        key: this.item.key,
        amount: this.selectedAmountToSell,
      });
      this.hideDialog();
    },
    hideDialog () {
      this.$root.$emit('bv::hide::modal', 'sell-modal');
    },
  },
};
</script>
