<template>
  <b-modal
    id="buy-quest-modal"
    :hide-header="true"
    @change="onChange($event)"
  >
    <span
      v-if="withPin"
      class="badge badge-pill badge-dialog"
      :class="{'item-selected-badge': isPinned}"
      @click.prevent.stop="togglePinned()"
    >
      <span
        class="svg-icon inline color icon-10"
        v-html="icons.pin"
      ></span>
    </span>
    <div class="close">
      <span
        class="svg-icon inline icon-10"
        aria-hidden="true"
        @click="hideDialog()"
        v-html="icons.close"
      ></span>
    </div>
    <div
      v-if="item != null"
      class="content"
    >
      <div class="inner-content">
        <questDialogContent :item="item" />
        <div class="purchase-amount">
          <div class="how-many-to-buy">
            <strong>{{ $t('howManyToBuy') }}</strong>
          </div>
          <div
            v-if="item.addlNotes"
            class="mb-3"
          >
            {{ item.addlNotes }}
          </div>
          <div class="box">
            <input
              v-model.number="selectedAmountToBuy"
              type="number"
              min="0"
              step="1"
            >
          </div>
          <span
            class="svg-icon inline icon-32"
            aria-hidden="true"
            v-html="currencyIcon"
          ></span>
          <span
            class="value"
            :class="priceType"
          >{{ item.value }}</span>
        </div>
        <button
          v-if="priceType === 'gems'
            && !enoughCurrency(priceType, item.value * selectedAmountToBuy)"
          class="btn btn-primary"
          @click="purchaseGems()"
        >
          {{ $t('purchaseGems') }}
        </button>
        <button
          v-else
          class="btn btn-primary"
          :class="{'notEnough': !enoughCurrency(priceType, item.value * selectedAmountToBuy)}"
          :disabled="numberInvalid"
          @click="buyItem()"
        >
          {{ $t('buyNow') }}
        </button>
      </div>
    </div>
    <div
      v-if="item.drop"
      class="right-sidebar"
    >
      <questDialogDrops :item="item" />
    </div>
    <div
      slot="modal-footer"
      class="clearfix"
    >
      <span class="balance float-left">{{ $t('yourBalance') }}</span>
      <balanceInfo
        class="float-right"
        :with-hourglass="priceType === 'hourglasses'"
        :currency-needed="priceType"
        :amount-needed="item.value"
      />
    </div>
  </b-modal>
</template>

<style lang="scss">
  @import '~@/assets/scss/colors.scss';
  @import '~@/assets/scss/modal.scss';

  #buy-quest-modal {
    @include centeredModal();

    .modal-dialog {
      margin-top: 8%;
      width: 448px;
    }

    .content {
      text-align: center;
    }

    .item-wrapper {
      margin-bottom: 0 !important;
    }

    .inner-content {
      margin: 33px auto auto;
    }


    .questInfo {
      width: 70%;
      margin: 0 auto 10px auto;
    }

    .right-sidebar {
      position: absolute;
      right: -350px;
      top: 25px;
      border-radius: 8px;
      background-color: $gray-600;
      box-shadow: 0 2px 16px 0 rgba(26, 24, 29, 0.32);
      display: flex;
      align-items: center;
      flex-direction: column;
      width: 364px;
      z-index: -1;
      height: 100%;
    }

    span.svg-icon.inline.icon-32 {
      height: 32px;
      width: 32px;
      margin-right: 8px;
      vertical-align: middle;
    }

    .value {
      width: 28px;
      height: 32px;
      font-family: Roboto;
      font-size: 24px;
      font-weight: bold;
      line-height: 1.33;
      vertical-align: middle;

      &.gems {
        color: $green-10;
      }

      &.gold {
        color: $yellow-10;
      }

      &.hourglasses {
        color: $hourglass-color;
      }
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

    .badge-dialog {
      color: $gray-300;
      position: absolute;
      left: -14px;
      padding: 8px 10px;
      top: -12px;
      background: white;
      cursor: pointer;

      &.item-selected-badge {
        background: $purple-300;
        color: $white;
      }
    }

    .notEnough {
      pointer-events: none;
      opacity: 0.55;
    }

    .purchase-amount {
      margin-top: 24px;

      .how-many-to-buy {
        margin-bottom: 16px;
      }

      .box {
        display: inline-block;
        width: 74px;
        height: 40px;
        border-radius: 2px;
        background-color: #ffffff;
        box-shadow: 0 2px 2px 0 rgba(26, 24, 29, 0.16), 0 1px 4px 0 rgba(26, 24, 29, 0.12);
        margin-right: 24px;

        input {
          width: 100%;
          border: none;
        }

        input::-webkit-contacts-auto-fill-button {
          visibility: hidden;
          display: none !important;
          pointer-events: none;
          position: absolute;
          right: 0;
        }
      }
    }
  }
</style>

<script>
import { mapState } from '@/libs/store';

import svgClose from '@/assets/svg/close.svg';
import svgGold from '@/assets/svg/gold.svg';
import svgGem from '@/assets/svg/gem.svg';
import svgPin from '@/assets/svg/pin.svg';
import svgExperience from '@/assets/svg/experience.svg';
import svgHourglasses from '@/assets/svg/hourglass.svg';

import BalanceInfo from '../balanceInfo.vue';
import currencyMixin from '../_currencyMixin';
import notifications from '@/mixins/notifications';
import buyMixin from '@/mixins/buy';
import numberInvalid from '@/mixins/numberInvalid';

import questDialogDrops from './questDialogDrops';
import questDialogContent from './questDialogContent';

export default {
  components: {
    BalanceInfo,
    questDialogDrops,
    questDialogContent,
  },
  mixins: [buyMixin, currencyMixin, notifications, numberInvalid],
  props: {
    item: {
      type: Object,
    },
    priceType: {
      type: String,
    },
    withPin: {
      type: Boolean,
    },
  },
  data () {
    return {
      icons: Object.freeze({
        close: svgClose,
        gold: svgGold,
        gem: svgGem,
        pin: svgPin,
        experience: svgExperience,
        hourglass: svgHourglasses,
      }),

      isPinned: false,
      selectedAmountToBuy: 1,
    };
  },
  computed: {
    ...mapState({
      content: 'content',
    }),
    itemText () {
      if (this.item.text instanceof Function) {
        return this.item.text();
      }
      return this.item.text;
    },
    itemNotes () {
      if (this.item.notes instanceof Function) {
        return this.item.notes();
      }
      return this.item.notes;
    },
    currencyIcon () {
      if (this.priceType === 'gold') return this.icons.gold;
      if (this.priceType === 'hourglasses') return this.icons.hourglass;
      return this.icons.gem;
    },
  },
  watch: {
    item: function itemChanged () {
      this.isPinned = this.item && this.item.pinned;
    },
  },
  methods: {
    onChange ($event) {
      this.selectedAmountToBuy = 1;
      this.$emit('change', $event);
    },
    buyItem () {
      if (!this.confirmPurchase(this.item.currency, this.item.value * this.selectedAmountToBuy)) {
        return;
      }
      this.makeGenericPurchase(this.item, 'buyQuestModal', this.selectedAmountToBuy);
      this.purchased(this.item.text);
      this.hideDialog();
    },
    togglePinned () {
      this.isPinned = this.$store.dispatch('user:togglePinnedItem', { type: this.item.pinType, path: this.item.path });

      if (!this.isPinned) {
        this.text(this.$t('unpinnedItem', { item: this.item.text }));
      }
    },
    hideDialog () {
      this.$root.$emit('bv::hide::modal', 'buy-quest-modal');
    },
    getDropIcon (drop) {
      switch (drop.type) {
        case 'gear':
          return `shop_${drop.key}`;
        case 'hatchingPotions':
          return `Pet_HatchingPotion_${drop.key}`;
        case 'food':
          return `Pet_Food_${drop.key}`;
        case 'eggs':
          return `Pet_Egg_${drop.key}`;
        case 'quests':
          return `inventory_quest_scroll_${drop.key}`;
        default:
          return '';
      }
    },
    getDropName (drop) {
      switch (drop.type) {
        case 'gear':
          return this.content.gear.flat[drop.key].text();
        case 'quests':
          return this.content.quests[drop.key].text();
        case 'hatchingPotions':
          return this.$t('namedHatchingPotion', { type: this.content.hatchingPotions[drop.key].text() });
        case 'food':
          return this.content.food[drop.key].text();
        case 'eggs':
          return this.content.eggs[drop.key].text();
        default:
          return `Unknown type: ${drop.type}`;
      }
    },
    purchaseGems () {
      this.$root.$emit('bv::show::modal', 'buy-gems');
    },
  },
};
</script>
