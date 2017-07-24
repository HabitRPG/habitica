<template lang="pug">
b-popover(
  :triggers="[showPopover?'hover':'']",
  :placement="popoverPosition",
)
  span(slot="content")
    slot(name="popoverContent", :item="item")

  .item-wrapper(@click="click()")
    .item(
      :class="{'item-empty': emptyItem, 'highlight': highlightBorder}",
    )
      slot(name="itemBadge", :item="item", :emptyItem="emptyItem")
      div.shop-content
        span.svg-icon.inline.lock(v-if="item.locked" v-html="icons.lock")


        div.image(:class="itemContentClass")

        div.price
          span.svg-icon.inline.icon-16(v-html="(priceType  === 'gems') ? icons.gem : icons.gold")

          span.price-label(:class="priceType") {{ price }}

</template>

<style lang="scss" scoped>
  @import '~client/assets/scss/colors.scss';

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
  import svgLock from 'assets/svg/lock.svg';

  export default {
    components: {
      bPopover,
    },
    data () {
      return {
        icons: Object.freeze({
          gem: svgGem,
          gold: svgGold,
          lock: svgLock,
        }),
      };
    },
    props: {
      item: {
        type: Object,
      },
      itemContentClass: {
        type: String,
      },
      price: {
        type: Number,
        default: -1,
      },
      priceType: {
        type: String,
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
    methods: {
      click () {
        this.$emit('click', {});
      },
    },
  };
</script>
