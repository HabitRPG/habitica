<template lang="pug">
b-popover(
  :triggers="[showPopover?'hover':'']",
  :placement="popoverPosition",
)
  span(slot="content")
    slot(name="popoverContent", :item="item")
      equipmentAttributesPopover(
        v-if="item.purchaseType==='gear'",
        :item="item"
      )
      div(v-else)
        h4.popover-content-title(v-once) {{ item.text }}
        .popover-content-text(v-if="showNotes", v-once) {{ item.notes }}

  .item-wrapper(@click="click()")
    .item(
      :class="{'item-empty': emptyItem, 'highlight-border': highlightBorder}",
    )
      slot(name="itemBadge", :item="item", :emptyItem="emptyItem")
      div.shop-content
        span.svg-icon.inline.lock(v-if="item.locked" v-html="icons.lock")

        div.image
          div(:class="item.class", v-once)
          slot(name="itemImage", :item="item")

        div.price
          span.svg-icon.inline.icon-16(v-html="icons[currencyClass]")

          span.price-label(:class="currencyClass", v-once) {{ getPrice() }}

</template>

<style lang="scss" scoped>
  @import '~client/assets/scss/colors.scss';

  .item-wrapper {
    z-index: 10;
  }

  .item {
    min-height: 106px;
  }

  .item.item-empty {
    border-radius: 2px;
    background-color: #f9f9f9;
    box-shadow: 0 2px 2px 0 rgba($black, 0.16), 0 1px 4px 0 rgba($black, 0.12);
  }

  .shop-content {
    display: flex;
    flex-direction: column;
    align-items: center;

    & > * {
      margin-top : 12px;
    }
  }

  .image {
    height: 50px;
  }


  .price {
    .svg-icon {
      padding-top: 2px;
      margin-right: 4px;
    }

    margin-bottom: 8px;
  }

  .price-label {
    height: 16px;
    font-family: Roboto;
    font-size: 16px;
    font-weight: bold;
    line-height: 1.33;

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

  span.svg-icon.inline.lock {
    height: 12px;
    width: 10px;
    position: absolute;
    right: 8px;
    top: 8px;
    margin-top: 0;
  }
</style>

<script>
  import bPopover from 'bootstrap-vue/lib/components/popover';

  import svgGem from 'assets/svg/gem.svg';
  import svgGold from 'assets/svg/gold.svg';
  import svgHourglasses from 'assets/svg/hourglass.svg';
  import svgLock from 'assets/svg/lock.svg';

  import EquipmentAttributesPopover from 'client/components/inventory/equipment/attributesPopover';

  export default {
    components: {
      bPopover,
      EquipmentAttributesPopover,
    },
    data () {
      return {
        icons: Object.freeze({
          gems: svgGem,
          gold: svgGold,
          lock: svgLock,
          hourglasses: svgHourglasses,
        }),
      };
    },
    props: {
      item: {
        type: Object,
      },
      price: {
        type: Number,
        default: -1,
      },
      emptyItem: {
        type: Boolean,
        default: false,
      },
      highlightBorder: {
        type: Boolean,
        default: false,
      },
      popoverPosition: {
        type: String,
        default: 'bottom',
      },
      showPopover: {
        type: Boolean,
        default: true,
      },
    },
    computed: {
      showNotes () {
        if (['armoire', 'potion'].indexOf(this.item.path) > -1) return true;
      },
      currencyClass () {
        if (this.item.currency && this.icons[this.item.currency]) {
          return this.item.currency;
        } else {
          return 'gold';
        }
      },
    },
    methods: {
      click () {
        this.$emit('click', {});
      },
      getPrice () {
        if (this.price === -1) {
          return this.item.value;
        } else {
          return this.price;
        }
      },
    },
  };
</script>
