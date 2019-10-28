<template>
  <b-modal
    id="sell-modal"
    :hide-header="true"
    @change="onChange($event)"
  >
    <div class="close">
      <span
        class="svg-icon inline icon-10"
        aria-hidden="true"
        @click="hideDialog()"
        v-html="icons.close"
      ></span>
    </div>
    <div
      v-if="item"
      class="content"
    >
      <div class="inner-content">
        <item
          class="flat"
          :item="item"
          :item-content-class="itemContextToSell.itemClass"
          :show-popover="false"
        >
          <countBadge
            slot="itemBadge"
            :show="true"
            :count="itemContextToSell.itemCount"
          />
        </item>
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
            <div>
              <b class="how-many-to-sell">{{ $t('howManyToSell') }}</b>
            </div>
            <div>
              <b-input
                v-model="selectedAmountToSell"
                class="itemsToSell"
                type="number"
                :max="itemContextToSell.itemCount"
                min="1"
                step="1"
                @keyup.native="preventNegative($event)"
              />
              <span
                class="svg-icon inline icon-32"
                aria-hidden="true"
                v-html="icons.gold"
              ></span>
              <span class="value">{{ item.value }}</span>
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

  @import '~@/assets/scss/modal.scss';
  @import '~@/assets/scss/colors.scss';

  #sell-modal {
    @include centeredModal();

    .itemsToSell {
      display: inline-block;
      width: 5em;
    }

    .modal-dialog {
      width: 330px;
    }

    .content {
      text-align: center;

    }
    .inner-content {
      margin: 33px auto auto;
      width: 282px;
    }

    span.svg-icon.inline.icon-32 {
      height: 32px;
      width: 32px;

      margin-left: 24px;
      margin-right: 8px;

      vertical-align: middle;
    }

    .value {
      width: 28px;
      height: 32px;
      font-size: 24px;
      font-weight: bold;
      line-height: 1.33;
      color: #df911e;

      vertical-align: middle;
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

import BalanceInfo from '../balanceInfo.vue';
import Item from '@/components/inventory/item';
import CountBadge from '@/components/ui/countBadge';

export default {
  components: {
    BalanceInfo,
    Item,
    CountBadge,
  },
  data () {
    return {
      selectedAmountToSell: 1,
      itemContextToSell: null,

      icons: Object.freeze({
        close: svgClose,
        gold: svgGold,
        gem: svgGem,
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
  destroyed () {
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
