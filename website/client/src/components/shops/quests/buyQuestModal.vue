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
          <div>
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
          class="btn btn-primary"
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

    .modal-body {
      padding-bottom: 0px;
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
      padding: 1rem 1.5rem;

      &> * {
        margin: 0;
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

      .total {
        font-size: 0.825rem;
        line-height: 1.71;
        font-weight: bold;

        &.gold {
          color: $gold-color;
        }

        &.gems {
          color: $gems-color;
        }

        & .hourglasses {
          color: $hourglass-color;
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

      // .box {
      //   display: inline-block;
      //   width: 74px;
      //   height: 40px;
      //   border-radius: 2px;
      //   background-color: #ffffff;
      //   box-shadow: 0 2px 2px 0 rgba(26, 24, 29, 0.16), 0 1px 4px 0 rgba(26, 24, 29, 0.12);
      //   margin-right: 24px;

      //   input {
      //     width: 100%;
      //     border: none;
      //   }

      //   input::-webkit-contacts-auto-fill-button {
      //     visibility: hidden;
      //     display: none !important;
      //     pointer-events: none;
      //     position: absolute;
      //     right: 0;
      //   }
      // }
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
</style>

<style lang="scss" scoped>
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
</style>

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
        gem: svgGem,
        gold: svgGold,
        hourglass: svgHourglasses,
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
      if (this.priceType === 'hourglasses') return this.icons.hourglass;
      return this.icons.gem;
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
