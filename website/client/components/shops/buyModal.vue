<template lang="pug">
  b-modal#buy-modal(
    :hide-header="true",
    @change="onChange($event)"
  )
    span.badge.badge-pill.badge-dialog(
      :class="{'item-selected-badge': isPinned}",
      v-if="withPin",
      @click.prevent.stop="togglePinned()"
    )
      span.svg-icon.inline.color.icon-10(v-html="icons.pin")

    div.close
      span.svg-icon.inline.icon-10(aria-hidden="true", v-html="icons.close", @click="hideDialog()")

    div.content(v-if="item != null")
      div.inner-content
        slot(name="item", :item="item")
          div(v-if="showAvatar")
            avatar(
              :showVisualBuffs="false",
              :member="user",
              :avatarOnly="true",
              :hideClassBadge="true",
              :withBackground="true",
              :overrideAvatarGear="getAvatarOverrides(item)",
              :spritesMargin="'0px auto 0px -24px'",
            )
          item.flat.bordered-item(
            :item="item",
            :itemContentClass="item.class",
            :showPopover="false",
            v-else-if="item.key != 'gem'"
          )

        h4.title {{ itemText }}
        div.text(v-html="itemNotes")

        slot(name="additionalInfo", :item="item")
          equipmentAttributesGrid.bordered(
            v-if="showAttributesGrid",
            :item="item"
          )

        .purchase-amount
          .how-many-to-buy(v-if='showAmountToBuy(item)')
            strong {{ $t('howManyToBuy') }}
          div(v-if='showAmountToBuy(item)')
            .box
              input(type='number', min='0', v-model='selectedAmountToBuy')
            span(:class="{'notEnough': notEnoughCurrency}")
              span.svg-icon.inline.icon-32(aria-hidden="true", v-html="icons[getPriceClass()]")
              span.value(:class="getPriceClass()") {{ item.value }}

        .gems-left(v-if='item.key === "gem"')
          strong(v-if='gemsLeft > 0') {{ gemsLeft }} {{ $t('gemsRemaining') }}
          strong(v-if='gemsLeft === 0') {{ $t('maxBuyGems') }}

        div(v-if='attemptingToPurchaseMoreGemsThanAreLeft')
          | {{$t('notEnoughGemsToBuy')}}

        button.btn.btn-primary(
          @click="purchaseGems()",
          v-if="getPriceClass() === 'gems' && !this.enoughCurrency(getPriceClass(), item.value * selectedAmountToBuy)"
        ) {{ $t('purchaseGems') }}

        button.btn.btn-primary(
          @click="buyItem()",
          v-else,
          :disabled='item.key === "gem" && gemsLeft === 0 || attemptingToPurchaseMoreGemsThanAreLeft',
          :class="{'notEnough': !preventHealthPotion || !this.enoughCurrency(getPriceClass(), item.value * selectedAmountToBuy)}"
        ) {{ $t('buyNow') }}

    div.limitedTime(v-if="item.event")
      span.svg-icon.inline.icon-16(v-html="icons.clock")
      span.limitedString {{ limitedString }}

    div.clearfix(slot="modal-footer")
      span.balance.float-left {{ $t('yourBalance') }}
      balanceInfo(
        :withHourglass="getPriceClass() === 'hourglasses'",
        :currencyNeeded="getPriceClass()",
        :amountNeeded="item.value"
      ).float-right
</template>

<style lang="scss">
  @import '~client/assets/scss/colors.scss';
  @import '~client/assets/scss/modal.scss';

  #buy-modal {
    @include centeredModal();

    .modal-dialog {
      width: 330px;
    }

    .avatar {
      cursor: default;
      margin: 0 auto;
    }

    .content {
      text-align: center;
    }

    .item-wrapper {
      margin-bottom: 0 !important;
    }

    .inner-content {
      margin: 33px auto auto;
      width: 282px;
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

    .content-text {
      font-family: 'Roboto', sans-serif;
      font-size: 14px;
      font-weight: normal;
      line-height: 1.43;

      width: 400px;
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
        color: $yellow-10
      }

      &.hourglasses {
        color: $blue-10;
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

    .limitedTime {
      height: 32px;
      background-color: #6133b4;
      width: calc(100% + 30px);
      margin: 0 -15px; // the modal content has its own padding

      font-size: 12px;
      line-height: 1.33;
      text-align: center;
      color: $white;

      display: flex;
      align-items: center;
      justify-content: center;

      .limitedString {
        height: 16px;
        margin-left: 8px;
      }
    }

    .bordered {
      margin-top: 8px;
    }

    .gems-left {
      margin-top: .5em;
    }
  }
</style>

<script>
  import * as Analytics from 'client/libs/analytics';
  import spellsMixin from 'client/mixins/spells';
  import planGemLimits from 'common/script/libs/planGemLimits';

  import svgClose from 'assets/svg/close.svg';
  import svgGold from 'assets/svg/gold.svg';
  import svgGem from 'assets/svg/gem.svg';
  import svgHourglasses from 'assets/svg/hourglass.svg';
  import svgPin from 'assets/svg/pin.svg';
  import svgClock from 'assets/svg/clock.svg';

  import BalanceInfo  from './balanceInfo.vue';
  import currencyMixin from './_currencyMixin';
  import notifications from 'client/mixins/notifications';
  import buyMixin from 'client/mixins/buy';

  import { mapState } from 'client/libs/store';

  import EquipmentAttributesGrid from './market/equipmentAttributesGrid.vue';

  import Item from 'client/components/inventory/item';
  import Avatar from 'client/components/avatar';

  import seasonalShopConfig from 'common/script/libs/shops-seasonal.config';

  import moment from 'moment';

  const hideAmountSelectionForPurchaseTypes = [
    'gear', 'backgrounds', 'mystery_set', 'card',
    'rebirth_orb', 'fortify', 'armoire', 'keys',
  ];

  export default {
    mixins: [currencyMixin, notifications, spellsMixin, buyMixin],
    components: {
      BalanceInfo,
      EquipmentAttributesGrid,
      Item,
      Avatar,
    },
    data () {
      return {
        icons: Object.freeze({
          close: svgClose,
          gold: svgGold,
          gems: svgGem,
          hourglasses: svgHourglasses,
          pin: svgPin,
          clock: svgClock,
        }),

        selectedAmountToBuy: 1,
        isPinned: false,
      };
    },
    computed: {
      ...mapState({user: 'user.data'}),
      showAvatar () {
        return ['backgrounds', 'gear', 'mystery_set'].includes(this.item.purchaseType);
      },

      preventHealthPotion () {
        if (this.item.key === 'potion' && this.user.stats.hp >= 50) {
          return false;
        }

        return true;
      },

      showAttributesGrid () {
        return this.item.purchaseType === 'gear';
      },

      itemText () {
        if (this.item.text instanceof Function) {
          return this.item.text();
        } else {
          return this.item.text;
        }
      },
      itemNotes () {
        if (this.item.notes instanceof Function) {
          return this.item.notes();
        } else {
          return this.item.notes;
        }
      },
      limitedString () {
        return this.$t('limitedOffer', {date: moment(seasonalShopConfig.dateRange.end).format('LL')});
      },
      gemsLeft () {
        if (!this.user.purchased.plan) return 0;
        return planGemLimits.convCap + this.user.purchased.plan.consecutive.gemCapExtra - this.user.purchased.plan.gemsBought;
      },
      attemptingToPurchaseMoreGemsThanAreLeft () {
        if (this.item && this.item.key && this.item.key === 'gem' && this.selectedAmountToBuy > this.gemsLeft) return true;
        return false;
      },
      notEnoughCurrency () {
        return !this.enoughCurrency(this.getPriceClass(), this.item.value * this.selectedAmountToBuy);
      },
    },
    watch: {
      item: function itemChanged () {
        this.isPinned = this.item && this.item.pinned;
        this.selectedAmountToBuy = 1;
      },
    },
    methods: {
      onChange ($event) {
        this.$emit('change', $event);
      },
      buyItem () {
        // @TODO: I  think we should buying to the items. Turn the items into classes, and use polymorphism
        if (this.item.buy) {
          this.item.buy();
          this.$emit('buyPressed', this.item);
          this.hideDialog();
          return;
        }

        if (this.item.currency === 'gems' &&
          !confirm(this.$t('purchaseFor', { cost: this.item.value * this.selectedAmountToBuy }))) {
          return;
        }

        if (this.item.currency === 'hourglasses' &&
          !confirm(this.$t('purchaseForHourglasses', { cost: this.item.value }))) {
          return;
        }

        if (this.item.cast) {
          this.castStart(this.item);
        } else if (this.genericPurchase) {
          this.makeGenericPurchase(this.item, 'buyModal', this.selectedAmountToBuy);
          this.purchased(this.item.text);
        }

        this.$emit('buyPressed', this.item);
        this.hideDialog();
      },
      purchaseGems () {
        if (this.item.key === 'rebirth_orb') {
          Analytics.track({
            hitType: 'event',
            eventCategory: 'button',
            eventAction: 'click',
            eventLabel: 'Gems > Rebirth',
          });
        }
        this.$root.$emit('bv::show::modal', 'buy-gems');
      },
      togglePinned () {
        this.isPinned = this.$store.dispatch('user:togglePinnedItem', {type: this.item.pinType, path: this.item.path});

        if (!this.isPinned) {
          this.text(this.$t('unpinnedItem', {item: this.item.text}));
        }
      },
      hideDialog () {
        this.$root.$emit('bv::hide::modal', 'buy-modal');
      },
      getPriceClass () {
        if (this.priceType && this.icons[this.priceType]) {
          return this.priceType;
        } else if (this.item.currency && this.icons[this.item.currency]) {
          return this.item.currency;
        } else {
          return 'gold';
        }
      },
      showAmountToBuy (item) {
        if (hideAmountSelectionForPurchaseTypes.includes(item.purchaseType)) {
          return false;
        } else {
          return true;
        }
      },
      getAvatarOverrides (item) {
        switch (item.purchaseType) {
          case 'gear':
            return {
              [item.type]: item.key,
            };
          case 'backgrounds':
            return {
              background: item.key,
            };
          case 'mystery_set': {
            let gear = {};

            item.items.map((setItem) => {
              gear[setItem.type] = setItem.key;
            });

            return gear;
          }
        }

        return {};
      },
    },
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
      genericPurchase: {
        type: Boolean,
        default: true,
      },
    },
  };
</script>
