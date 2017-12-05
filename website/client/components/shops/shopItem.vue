<template lang="pug">
div
  .item-wrapper(@click="click()", :id="itemId")
    .item(:class="getItemClasses()")
      slot(name="itemBadge", :item="item", :emptyItem="emptyItem")

      span.badge.badge-pill.badge-item.badge-clock(
        v-if="item.event && showEventBadge",
      )
        span.svg-icon.inline.clock(v-html="icons.clock")

      div.shop-content
        span.svg-icon.inline.lock(v-if="item.locked" v-html="icons.lock")
        span.suggestedDot(v-if="item.isSuggested")

        div.image
          div(:class="item.class", v-once)
          slot(name="itemImage", :item="item")

        div.price
          span.svg-icon.inline.icon-16(v-html="icons[currencyClass]", v-once)
          span.price-label(:class="currencyClass", v-once) {{ getPrice() }}
  b-popover(
    :target="itemId",
    v-if="showPopover",
    triggers="hover",
    :placement="popoverPosition",
  )
    slot(name="popoverContent", :item="item")
      equipmentAttributesPopover(
        v-if="item.purchaseType==='gear'",
        :item="item"
      )
      div.questPopover(v-else-if="item.purchaseType === 'quests'")
        h4.popover-content-title {{ item.text }}
        questInfo(:quest="item")
      div(v-else)
        h4.popover-content-title(v-once) {{ item.text }}
        .popover-content-text(v-if="showNotes", v-once) {{ item.notes }}

      div(v-if="item.event") {{ limitedString }}
</template>

<style lang="scss" scoped>
  @import '~client/assets/scss/colors.scss';

  .item-wrapper {
    z-index: 10;
  }

  .item {
    min-height: 106px;
  }

  .item:not(.locked) {
    cursor: pointer;
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

    margin-top: 1.25em;
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

  span.badge.badge-pill.badge-item.badge-clock {
    height: 24px;
    width: 24px;
    background-color: $purple-300;
    position: absolute;
    left: -8px;
    top: -12px;
    margin-top: 0;
    padding: 4px;
  }

  span.svg-icon.inline.clock {
    height: 16px;
    width: 16px;
  }

  .suggestedDot {
    width: 6px;
    height: 6px;
    background-color: $suggested-item-color;
    border-radius: 4px;

    position: absolute;
    right: 8px;
    top: 8px;
    margin-top: 0;
  }

  .icon-48 {
    width: 48px;
    height: 48px;
  }
</style>

<script>
  import uuid from 'uuid';

  import svgGem from 'assets/svg/gem.svg';
  import svgGold from 'assets/svg/gold.svg';
  import svgHourglasses from 'assets/svg/hourglass.svg';
  import svgLock from 'assets/svg/lock.svg';
  import svgClock from 'assets/svg/clock.svg';

  import EquipmentAttributesPopover from 'client/components/inventory/equipment/attributesPopover';

  import QuestInfo from './quests/questInfo.vue';

  import moment from 'moment';

  import seasonalShopConfig from 'common/script/libs/shops-seasonal.config';

  export default {
    components: {
      EquipmentAttributesPopover,
      QuestInfo,
    },
    data () {
      return Object.freeze({
        itemId: uuid.v4(),
        icons: {
          gems: svgGem,
          gold: svgGold,
          lock: svgLock,
          hourglasses: svgHourglasses,
          clock: svgClock,
        },
      });
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
      showEventBadge: {
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
      limitedString () {
        return this.item.owned === false ? '' :
          this.$t('limitedOffer', {date: moment(seasonalShopConfig.dateRange.end).format('LL')});
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
      getItemClasses () {
        return {
          'item-empty': this.emptyItem,
          'highlight-border': this.highlightBorder,
          suggested: this.item.isSuggested,
          locked: this.item.locked,
        };
      },
    },
  };
</script>
