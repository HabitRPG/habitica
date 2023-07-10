<template>
  <b-modal
    id="buy-quest-modal"
    :hide-header="true"
    @change="onChange($event)"
  >
    <span
      v-if="withPin"
      class="badge-dialog"
      @click.prevent.stop="togglePinned()"
    >
      <pin-badge
        :pinned="isPinned"
      />
    </span>
    <div class="dialog-close">
      <close-icon @click="hideDialog()" />
    </div>
    <h2 class="text-center textCondensed">
      {{ $t('questDetails') }}
    </h2>
    <div
      v-if="item != null"
      class="content"
    >
      <div class="inner-content">
        <questDialogContent
          :item="item"
          :abbreviated="true"
        />
        <quest-rewards :quest="item" />
        <div
          v-if="!item.locked"
          class="purchase-amount"
        >
          <div class="item-cost">
            <span
              class="cost"
              :class="priceType"
            >
              <span
                class="svg-icon inline icon-24"
                aria-hidden="true"
                v-html="icons[priceType]"
              >
              </span>
              <span
                :class="priceType"
              >{{ item.value }}</span>
            </span>
          </div>
          <div class="how-many-to-buy">
            <strong>{{ $t('howManyToBuy') }}</strong>
          </div>
          <div
            v-if="item.addlNotes"
            class="mb-3"
          >
            {{ item.addlNotes }}
          </div>
          <div>
            <number-increment
              @updateQuantity="selectedAmountToBuy = $event"
            />
          </div>
          <div class="total-row">
            <span class="total-text">
              {{ $t('sendTotal') }}
            </span>
            <span
              class="svg-icon inline icon-20"
              aria-hidden="true"
              v-html="currencyIcon"
            ></span>
            <span
              class="total"
              :class="priceType"
            >{{ item.value * selectedAmountToBuy }}</span>
          </div>
        </div>
        <button
          v-if="priceType === 'gems'
            && !enoughCurrency(priceType, item.value * selectedAmountToBuy)
            && !item.locked"
          class="btn btn-primary"
          @click="purchaseGems()"
        >
          {{ $t('purchaseGems') }}
        </button>
        <button
          v-else
          class="btn btn-primary mb-4"
          :class="{'notEnough': !enoughCurrency(priceType, item.value * selectedAmountToBuy)}"
          :disabled="numberInvalid"
          @click="buyItem()"
        >
          {{ $t('buyNow') }}
        </button>
      </div>
    </div>
    <countdown-banner
      v-if="item.event"
      :end-date="endDate"
    />
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
  @import '~@/assets/scss/mixins.scss';

  #buy-quest-modal {
    @include centeredModal();

    h2 {
      color: $purple-300;
      margin-top: 1rem;
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

    .modal-dialog {
      margin-top: 8%;
      width: 448px !important;
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

    .item-notes {
      height: 48px;
      margin-top: 8px;
      padding-left: 48.5px;
      padding-right: 48.5px;
      line-height: 1.71;
      font-size: 0.875rem;
    }

    .questInfo {
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

    button.btn.btn-primary {
      margin-top: 14px;
      padding: 4px 16px;
      height: 32px;

      &:focus {
        border: 2px solid black;
      }
    }

    .balance {
      width: 74px;
      height: 16px;
      font-size: 12px;
      font-weight: bold;
      line-height: 1.33;
      color: $gray-200;
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

      .item-cost {
        padding-bottom: 16px;
        }

        .cost {
          height: 40px;
          font-size: 1.25rem;
          font-weight: bold;
          vertical-align: middle;
          padding: 8px 20px 8px 20px;

          &.gems {
            color: $green-10;
            background-color: rgba(36, 204, 143, 0.15);
            line-height: 1.4;
            margin: 0 0 0 -4px;
            border-radius: 20px;
          }

          &.gold {
            color: $yellow-5;
            background-color: rgba(255, 190, 93, 0.15);
            line-height: 1.4;
            margin: 0 0 0 -4px;
            border-radius: 20px;
          }

          &.hourglasses {
            color: $hourglass-color;
            background-color: rgba(41, 149, 205, 0.15);
            line-height: 1.4;
            margin: 0 0 0 -4px;
            border-radius: 20px;
            }
          }

    .total-row {
      font-weight: bold;
      font-size: 0.875rem;
      margin-top: 16px;
    }

    .total {
      font-weight: bold;
      font-size: 0.875rem;
      margin-top: 16px;

      &.gems {
        color: $green-10;
      }

      &.gold {
        color: $yellow-5;
      }

      &.hourglasses {
        color: $hourglass-color;
      }
    }

    .total-text {
      color: $gray-50;
      font-weight: bold;
      font-size: 0.875rem;
      height: 24px;
      line-height: 1.71;
      padding-right: 4px;

      &.gems {
        color: $green-10;
      }

      &.gold {
        color: $yellow-5;
      }

      &.hourglasses {
        color: $hourglass-color;
      }
    }

  span.svg-icon.inline.icon-20 {
      height: 20px;
      width: 20px;
      margin-right: 4px;
      vertical-align: middle;
    }

  span.svg-icon.inline.icon-24 {
    height: 24px;
    width: 24px;
    margin-right: 8px;
    vertical-align: middle;
  }

  span.svg-icon.inline.icon-32 {
    height: 32px;
    width: 32px;
    margin-right: 8px;
    vertical-align: middle;
  }

    @media only screen and (max-width: 1000px) {
      .modal-dialog {
        max-width: 80%;
        width: 80% !important;

        .modal-body {
          flex-direction: column;
          display: flex;
        }
      }
    }
  }
}
</style>

<!-- <style lang="scss" scoped>
  @import '~@/assets/scss/colors.scss';

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
</style> -->

<script>
import moment from 'moment';
import { mapState } from '@/libs/store';

import svgClock from '@/assets/svg/clock.svg';
import svgClose from '@/assets/svg/close.svg';
import svgExperience from '@/assets/svg/experience.svg';
import svgGem from '@/assets/svg/gem.svg';
import svgGold from '@/assets/svg/gold.svg';
import svgHourglasses from '@/assets/svg/hourglass.svg';
import svgPositive from '@/assets/svg/positive.svg';
import svgNegative from '@/assets/svg/negative.svg';

import BalanceInfo from '../balanceInfo.vue';
import currencyMixin from '../_currencyMixin';
import notifications from '@/mixins/notifications';
import buyMixin from '@/mixins/buy';
import numberInvalid from '@/mixins/numberInvalid';
import PinBadge from '@/components/ui/pinBadge';
import CountdownBanner from '../countdownBanner';
import numberIncrement from '@/components/shared/numberIncrement';

import questDialogContent from './questDialogContent';
import QuestRewards from './questRewards';
import CloseIcon from '../../shared/closeIcon';

export default {
  components: {
    CloseIcon,
    QuestRewards,
    BalanceInfo,
    PinBadge,
    questDialogContent,
    CountdownBanner,
    numberIncrement,
  },
  mixins: [buyMixin, currencyMixin, notifications, numberInvalid],
  props: {
    item: {
      type: Object,
    },
    priceType: {
      type: String,
      default: '',
    },
    withPin: {
      type: Boolean,
    },
  },
  data () {
    return {
      icons: Object.freeze({
        clock: svgClock,
        close: svgClose,
        experience: svgExperience,
        gems: svgGem,
        gold: svgGold,
        hourglasses: svgHourglasses,
        positive: svgPositive,
        negative: svgNegative,
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
      if (this.priceType === 'hourglasses') return this.icons.hourglasses;
      return this.icons.gems;
    },
    endDate () {
      return moment(this.item.event.end);
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
