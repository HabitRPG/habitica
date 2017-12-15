<template lang="pug">
  b-modal#buy-quest-modal(
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
        questDialogContent(:item="item")

        .purchase-amount
          .how-many-to-buy
            strong {{ $t('howManyToBuy') }}
          .box
            input(type='number', min='0', v-model='selectedAmountToBuy')
          span.svg-icon.inline.icon-32(aria-hidden="true", v-html="(priceType  === 'gems') ? icons.gem : icons.gold")
          span.value(:class="priceType") {{ item.value }}

        button.btn.btn-primary(
          @click="purchaseGems()",
          v-if="priceType === 'gems' && !this.enoughCurrency(priceType, item.value * selectedAmountToBuy)"
        ) {{ $t('purchaseGems') }}

        button.btn.btn-primary(
          @click="buyItem()",
          v-else,
          :class="{'notEnough': !this.enoughCurrency(priceType, item.value * selectedAmountToBuy)}"
        ) {{ $t('buyNow') }}

    div.right-sidebar(v-if="item.drop")
      questDialogDrops(:item="item")

    div.clearfix(slot="modal-footer")
      span.balance.float-left {{ $t('yourBalance') }}
      balanceInfo(
        :currencyNeeded="priceType",
        :amountNeeded="item.value"
      ).float-right
</template>

<style lang="scss">
  @import '~client/assets/scss/colors.scss';
  @import '~client/assets/scss/modal.scss';

  #buy-quest-modal {
    @include centeredModal();

    .modal-dialog {
      margin-top: 8%;
      width: 448px;
    }

    .content {
      text-align: center;
      overflow-y: scroll;
    }

    .item-wrapper {
      margin-bottom: 0 !important;
    }

    .inner-content {
      margin: 33px auto auto;
      width: 400px;
    }


    .questInfo {
      width: 70%;
      margin: 0 auto;
      margin-bottom: 10px;
    }

    .content-text {
      font-family: 'Roboto', sans-serif;
      font-size: 14px;
      font-weight: normal;
      line-height: 1.43;
      width: 400px;
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
        color: $yellow-10
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
  import {mapState} from 'client/libs/store';

  import svgClose from 'assets/svg/close.svg';
  import svgGold from 'assets/svg/gold.svg';
  import svgGem from 'assets/svg/gem.svg';
  import svgPin from 'assets/svg/pin.svg';
  import svgExperience from 'assets/svg/experience.svg';

  import BalanceInfo  from '../balanceInfo.vue';
  import currencyMixin from '../_currencyMixin';
  import QuestInfo from './questInfo.vue';
  import notifications from 'client/mixins/notifications';
  import buyMixin from 'client/mixins/buy';

  import questDialogDrops from './questDialogDrops';
  import questDialogContent from './questDialogContent';

  export default {
    mixins: [currencyMixin, notifications, buyMixin],
    components: {
      BalanceInfo,
      QuestInfo,
      questDialogDrops,
      questDialogContent,
    },
    data () {
      return {
        icons: Object.freeze({
          close: svgClose,
          gold: svgGold,
          gem: svgGem,
          pin: svgPin,
          experience: svgExperience,
        }),

        isPinned: false,
        selectedAmountToBuy: 1,
      };
    },
    watch: {
      item: function itemChanged () {
        this.isPinned = this.item && this.item.pinned;
      },
    },
    computed: {
      ...mapState({
        content: 'content',
      }),
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
        this.selectedAmountToBuy = 1;
        this.$emit('change', $event);
      },
      buyItem () {
        this.makeGenericPurchase(this.item, 'buyQuestModal', this.selectedAmountToBuy);
        this.purchased(this.item.text);
        this.hideDialog();
      },
      togglePinned () {
        this.isPinned = this.$store.dispatch('user:togglePinnedItem', {type: this.item.pinType, path: this.item.path});

        if (!this.isPinned) {
          this.text(this.$t('unpinnedItem', {item: this.item.text}));
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
  };
</script>
