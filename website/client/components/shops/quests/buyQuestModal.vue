<template lang="pug">
  b-modal#buy-quest-modal(
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

        h4.title {{ itemText }}
        div.text(v-html="itemNotes")

        questInfo.questInfo(:quest="item")

        div
          span.svg-icon.inline.icon-32(aria-hidden="true", v-html="(priceType  === 'gems') ? icons.gem : icons.gold")
          span.value(:class="priceType") {{ item.value }}

        button.btn.btn-primary(
          @click="purchaseGems()",
          v-if="priceType === 'gems' && !this.enoughCurrency(priceType, item.value)"
        ) {{ $t('purchaseGems') }}


        button.btn.btn-primary(
          @click="buyItem()",
          v-else,
          :class="{'notEnough': !this.enoughCurrency(priceType, item.value)}"
        ) {{ $t('buyNow') }}

    div.right-sidebar(v-if="item.drop")
      h3(v-once) {{ $t('rewards') }}
      div.reward-item
        span.svg-icon.inline.icon(v-html="icons.experience")
        span.reward-text {{ $t('amountExperience', { amount: item.drop.exp }) }}
      div.reward-item(v-if="item.drop.gp != 0")
        span.svg-icon.inline.icon(v-html="icons.gold")
        span.reward-text {{ $t('amountGold', { amount: item.drop.gp }) }}
      div.reward-item(v-for="drop in item.drop.items")
        span.icon
          div(:class="getDropIcon(drop)")
        span.reward-text {{ getDropName(drop) }}

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

    .content {
      text-align: center;
    }

    .item-wrapper {
      margin-bottom: 0 !important;
    }

    .inner-content {
      margin: 33px auto auto;
      width: 400px;
    }
    .text {
      max-height: 220px;
      margin-bottom: 8px;
      overflow-y: scroll;
      text-overflow: ellipsis;
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


      h3 {
        margin-top: 24px;
        margin-bottom: 16px;
      }

      .reward-item {
        width: 306px;
        height: 84px;
        border-radius: 2px;
        background-color: $white;
        margin-bottom: 8px;

        display: flex;
        flex-direction: row;
        align-items: center;

        .icon {
          margin: 18px;
          height: 48px;
          width: 48px;
        }

        .reward-text {
          font-weight: bold;
        }
      }
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
  }
</style>

<script>

  import {mapState} from 'client/libs/store';

  import bModal from 'bootstrap-vue/lib/components/modal';

  import svgClose from 'assets/svg/close.svg';
  import svgGold from 'assets/svg/gold.svg';
  import svgGem from 'assets/svg/gem.svg';
  import svgPin from 'assets/svg/pin.svg';
  import svgExperience from 'assets/svg/experience.svg';

  import BalanceInfo  from '../balanceInfo.vue';
  import currencyMixin from '../_currencyMixin';
  import QuestInfo from './questInfo.vue';
  import notifications from 'client/mixins/notifications';

  export default {
    mixins: [currencyMixin, notifications],
    components: {
      bModal,
      BalanceInfo,
      QuestInfo,
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
      };
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
        this.$emit('change', $event);
      },
      buyItem () {
        this.$store.dispatch('shops:genericPurchase', {
          pinType: this.item.pinType,
          type: this.item.purchaseType,
          key: this.item.key,
          currency: this.item.currency,
        });
        this.purchased(this.item.text);
        this.$emit('buyPressed', this.item);
        this.hideDialog();
      },
      togglePinned () {
        this.$emit('togglePinned', this.item);
      },
      hideDialog () {
        this.$root.$emit('hide::modal', 'buy-quest-modal');
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
        this.$root.$emit('show::modal', 'buy-gems');
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
