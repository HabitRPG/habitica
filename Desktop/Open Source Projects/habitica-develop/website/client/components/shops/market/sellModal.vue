<template lang="pug">
  b-modal#sell-modal(
    :visible="item != null",
    :hide-header="true",
    @change="onChange($event)"
  )
    div.close
      span.svg-icon.inline.icon-10(aria-hidden="true", v-html="icons.close", @click="hideDialog()")

    div.content(v-if="item")

      div.inner-content(v-if="item.sellWarningNote")
        slot(name="item", :item="item")

        h4.title {{ text ? text : item.text() }}
        div.text {{ item.sellWarningNote() }}
        br

      div.inner-content(v-else)
        slot(name="item", :item="item")

        h4.title {{ text ? text : item.text() }}
        div.text {{ item.notes() }}

        div
          b.how-many-to-sell {{ $t('howManyToSell') }}

        div
          b-input.itemsToSell(type="number", v-model="selectedAmountToSell", :max="itemCount", min="1")

          span.svg-icon.inline.icon-32(aria-hidden="true", v-html="icons.gold")
          span.value {{ item.value }}

        button.btn.btn-primary(@click="sellItems()") {{ $t('sell') }}

    div.clearfix(slot="modal-footer")
      span.balance.float-left {{ $t('yourBalance') }}
      balanceInfo.float-right
</template>
<style lang="scss">

  @import '~client/assets/scss/modal.scss';
  @import '~client/assets/scss/colors.scss';

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
  import svgClose from 'assets/svg/close.svg';
  import svgGold from 'assets/svg/gold.svg';
  import svgGem from 'assets/svg/gem.svg';

  import BalanceInfo  from '../balanceInfo.vue';

  export default {
    components: {
      BalanceInfo,
    },
    data () {
      return {
        selectedAmountToSell: 1,

        icons: Object.freeze({
          close: svgClose,
          gold: svgGold,
          gem: svgGem,
        }),
      };
    },
    methods: {
      onChange ($event) {
        this.$emit('change', $event);

        this.selectedAmountToSell = 1;
      },
      sellItems () {
        this.$store.dispatch('shops:sellItems', {
          type: this.itemType,
          key: this.item.key,
          amount: this.selectedAmountToSell,
        });
        this.hideDialog();
      },
      hideDialog () {
        this.$root.$emit('bv::hide::modal', 'sell-modal');
      },
    },
    props: {
      item: {
        type: Object,
      },
      itemType: {
        type: String,
      },
      text: {
        type: String,
      },
      itemCount: {
        type: Number,
      },
    },
  };
</script>
