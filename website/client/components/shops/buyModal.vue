<template lang="pug">
  b-modal#buy-modal(
    :visible="true",
    v-if="item != null",
    :hide-header="true",
    @change="onChange($event)"
  )
    span.badge.badge-pill.badge-dialog(
      :class="{'item-selected-badge': item.pinned}",
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

        div(:class="{'notEnough': !this.enoughCurrency(getPriceClass(), item.value)}")
          span.svg-icon.inline.icon-32(aria-hidden="true", v-html="icons[getPriceClass()]")
          span.value(:class="getPriceClass()") {{ item.value }}

        button.btn.btn-primary(
          @click="purchaseGems()",
          v-if="getPriceClass() === 'gems' && !this.enoughCurrency(getPriceClass(), item.value)"
        ) {{ $t('purchaseGems') }}

        button.btn.btn-primary(
          @click="buyItem()",
          v-else,
          :class="{'notEnough': !this.enoughCurrency(getPriceClass(), item.value)}"
        ) {{ $t('buyNow') }}

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
  }
</style>

<script>
  import bModal from 'bootstrap-vue/lib/components/modal';

  import svgClose from 'assets/svg/close.svg';
  import svgGold from 'assets/svg/gold.svg';
  import svgGem from 'assets/svg/gem.svg';
  import svgHourglasses from 'assets/svg/hourglass.svg';
  import svgPin from 'assets/svg/pin.svg';

  import BalanceInfo  from './balanceInfo.vue';
  import currencyMixin from './_currencyMixin';
  import notifications from 'client/mixins/notifications';

  import { mapState } from 'client/libs/store';

  import EquipmentAttributesGrid from './market/equipmentAttributesGrid.vue';

  import Item from 'client/components/inventory/item';
  import Avatar from 'client/components/avatar';

  export default {
    mixins: [currencyMixin, notifications],
    components: {
      bModal,
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
        }),
      };
    },
    computed: {
      ...mapState({user: 'user.data'}),
      showAvatar () {
        return ['backgrounds', 'gear', 'mystery_set'].includes(this.item.purchaseType);
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
    },
    methods: {
      onChange ($event) {
        this.$emit('change', $event);
      },
      buyItem () {
        if (this.genericPurchase) {
          this.$store.dispatch('shops:genericPurchase', {
            pinType: this.item.pinType,
            type: this.item.purchaseType,
            key: this.item.key,
            currency: this.item.currency,
          });

          this.purchased(this.item.text);
          this.$root.$emit('buyModal::boughtItem', this.item);
        }

        this.$emit('buyPressed', this.item);
        this.hideDialog();
      },
      purchaseGems () {
        this.$root.$emit('show::modal', 'buy-gems');
      },
      togglePinned () {
        if (!this.$store.dispatch('user:togglePinnedItem', {type: this.item.pinType, path: this.item.path})) {
          this.text(this.$t('unpinnedItem', {item: this.item.text}));
        }
      },
      hideDialog () {
        this.$root.$emit('hide::modal', 'buy-modal');
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
