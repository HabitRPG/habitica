<template>
  <b-modal
    id="sell-modal"
    :hide-header="true"
    @change="onChange($event)"
  >
    <div class="close">
      <span
        class="svg-icon inline icon-16"
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
          class="flat"
          :item="item"
          :item-content-class="itemContextToSell.itemClass"
          :show-popover="false"
        />
        <span class="owned">
          <!-- need to calculate totalOwned()  -->
          {{ $t('owned') }}: {{ itemContextToSell.itemCount }}
        </span>
        <h4 class="title">
          {{ itemContextToSell.itemName }}
        </h4>
        <div v-if="item.key === 'Saddle'">
          <div class="text">
            {{ item.sellWarningNote() }}
          </div>
          <br>
        </div>
        <div v-else>
          <div>
            <div class="text">
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
              <b class="how-many-to-sell">{{ $t('howManyToSell') }}</b>
            </div>
            <div>
              <number-increment
                @updateQuantity="selectedAmountToSell = $event"
              />
            </div>
            <div>
              <span class="total-text">
                {{ $t('sendTotal') }}
              </span>
              <span
                class="svg-icon inline icon-20"
                aria-hidden="true"
                v-html="icons.gold"
              ></span>
              <span class="total gold">
                {{ item.value * selectedAmountToSell }}
              </span>
            </div>
            <button
              class="btn btn-primary"
              @click="sellItems()"
            >
              {{ $t('sell') }}
            </button>
          </div>
        </div>
      </div>
    </div>
    <div
      slot="modal-footer"
      class="clearfix"
    >
      <span class="balance float-left">{{ $t('yourBalance') }}</span>
      <balanceInfo class="float-right" />
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
      width: 448px;;
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
      padding: 8px 41px;
      border-bottom-right-radius: 4px;
      border-bottom-left-radius: 4px;
      display: block;
      width: 141px;
      margin-left: 70px;
      margin-top: -36px;
      position: relative;
      z-index: 1;
    }

    .item {
      width: 141px;
      height: 147px;
      border-top-left-radius: 4px;
      border-top-right-radius: 4px;
      border-bottom-right-radius: 0px;
      border-bottom-left-radius: 0px;
    }

    .item-content {
      transform: scale(1.45, 1.45);
      top: -16px;
    }

    span.svg-icon.inline.icon-32 {
      height: 32px;
      width: 32px;
      margin-left: 24px;
      margin-right: 8px;
      vertical-align: middle;
    }

    span.svg-icon.inline.icon-24 {
      height: 24px;
      width: 24px;
      margin-right: 8px;
      vertical-align: middle;
    }

    span.svg-icon.inline.icon-20 {
      height: 20px;
      width: 20px;
      margin-right: 4px;
      vertical-align: middle;
    }

    span.svg-icon.inline.icon-16 {
      height: 16px;
      width: 16px;
      margin-right: 8px;
      vertical-align: middle;
    }

  .item-cost {
    padding-bottom: 16px;
    }

    .cost {
      height: 40px;
      font-size: 1.25rem;
      font-weight: bold;
      line-height: 1.4;
      vertical-align: middle;

      &.gold {
        color: $gold-color;
        border-radius: 20px;
        padding: 8px 20px 8px 20px;
        margin-top: 16px;
        margin-bottom: 16px;
        background-color: rgba(255, 190, 93, 0.15);
      }
    }

    .total {
      font-size: 0.825rem;
      line-height: 1.71;
      font-weight: bold;

      &.gold {
        color: $gold-color;
      }
    }

    .total-text {
      font-size: 0.825rem;
      line-height: 1.71;
      font-weight: bold;
      height: 24px;
      width: 37px;
      padding-right: 4px;
    }

    button.btn.btn-primary {
      margin-top: 24px;
      margin-bottom: 24px;
    }

    .balance {
      width: 74px;
      height: 16px;
      font-size: 12px;
      font-weight: bold;
      line-height: 1.33;
      color: $gray-200;
    }

    .modal-footer {
      height: 48px;
      background-color: $gray-700;
      border-bottom-right-radius: 8px;
      border-bottom-left-radius: 8px;
      display: block;
    }

    .how-many-to-sell {
      margin-bottom: 16px;
      display: block;
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
