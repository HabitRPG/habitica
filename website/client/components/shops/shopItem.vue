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
      slot(name="itemBadge", :item="item")
      div.shop-content
        div.image(:class="itemContentClass")

        div.price
          span.svg-icon.inline.icon-16(v-html="(priceType  === 'gems') ? icons.gem : icons.gold")

          span.price-label(:class="priceType") {{ price }}

</template>

<style lang="scss" scoped>
  @import '~client/assets/scss/colors.scss';

.item {
    height: auto;
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
</style>

<script>
  import bPopover from 'bootstrap-vue/lib/components/popover';

  import svgGem from 'assets/svg/gem.svg';
  import svgGold from 'assets/svg/gold.svg';

  export default {
    components: {
      bPopover,
    },
    data () {
      return {
        icons: Object.freeze({
          gem: svgGem,
          gold: svgGold,
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
