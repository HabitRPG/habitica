<template lang="pug">
  b-modal#buy-modal(
    :visible="true",
    v-if="item != null",
    :hide-header="true",
    @change="onChange($event)"
  )
    span.badge.badge-pill.badge-dialog(
      :class="{'item-selected-badge': true}",
      v-if="withPin"
    )
      span.svg-icon.inline.color.icon-10(v-html="icons.pin")

    div.close
      span.svg-icon.inline.icon-10(aria-hidden="true", v-html="icons.close", @click="hideDialog()")

    div.content(v-if="item != null")

      div.inner-content
        slot(name="item", :item="item")

        h4.title {{ itemText }}
        div.text {{ itemNotes }}

        slot(name="additionalInfo", :item="item")

        div
          span.svg-icon.inline.icon-32(aria-hidden="true", v-html="(priceType  === 'gems') ? icons.gem : icons.gold")
          span.value(:class="priceType") {{ item.value }}

        button.btn.btn-primary(@click="buyItem()") {{ $t('buyNow') }}

    div.clearfix(slot="modal-footer")
      span.balance.float-left {{ $t('yourBalance') }}
      balanceInfo.float-right


</template>
<style lang="scss">

  @import '~client/assets/scss/colors.scss';
  @import '~client/assets/scss/modal.scss';

  #buy-modal {
    @include centeredModal();

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
    }
  }
</style>

<script>
  import bModal from 'bootstrap-vue/lib/components/modal';

  import svgClose from 'assets/svg/close.svg';
  import svgGold from 'assets/svg/gold.svg';
  import svgGem from 'assets/svg/gem.svg';
  import svgPin from 'assets/svg/pin.svg';

  import BalanceInfo  from './balanceInfo.vue';

  export default {
    components: {
      bModal,
      BalanceInfo,
    },
    data () {
      return {
        icons: Object.freeze({
          close: svgClose,
          gold: svgGold,
          gem: svgGem,
          pin: svgPin,
        }),
      };
    },
    computed: {
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
        this.$store.dispatch('shops:buyItem', {key: this.item.key});
        this.hideDialog();
      },
      hideDialog () {
        this.$root.$emit('hide::modal', 'buy-modal');
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
