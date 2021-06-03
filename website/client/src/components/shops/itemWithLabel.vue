<template>
  <div>
    <div
      :id="itemId"
      class="item-wrapper"
      tabindex="0"
      @click="click()"
      @keypress.enter="click()"
    >
      <div
        class="item"
        :class="getItemClasses()"
      >
        <slot
          name="badges"
          :item="item"
          :emptyItem="emptyItem"
        ></slot>
        <div class="image">
          <div
            v-once
            :class="item.class"
          ></div>
          <slot
            name="itemImage"
            :item="item"
          ></slot>
        </div>
        <div
          class="d-flex label-holder align-items-center justify-content-center"
          :class="labelClass"
        >
          <slot
            name="label"
            :item="item"
          ></slot>
        </div>
      </div>
    </div>
    <b-popover
      v-if="showPopover"
      :target="itemId"
      triggers="hover focus"
      :placement="popoverPosition"
    >
      <slot
        name="popoverContent"
        :item="item"
      >
      </slot>
    </b-popover>
  </div>
</template>

<style lang="scss" scoped>
  @import '~@/assets/scss/colors.scss';

  .item-wrapper {
    z-index: 10;
  }

  .item {
    height: 7.5rem;
    width: 94px;
    border-radius: 4px;
    background-color: $white;
    box-shadow: 0 1px 3px 0 rgba($black, 0.12), 0 1px 2px 0 rgba($black, 0.24);
    cursor: initial;
    display: flex;
    flex-direction: column;

    &:hover {
      border-color: transparent;
    }

    &.locked .price {
      opacity: 0.5;
    }
  }

  .image {
    margin: 12px 13px;
    flex: 1;

    align-items: center;
    justify-content: center;
    display: flex;
  }

  .label-holder {
    height: 28px;
    font-weight: bold;
    line-height: 1.33;
    text-align: center;
    background-color: $gray-700;
    border-bottom-left-radius: 4px;
    border-bottom-right-radius: 4px;
  }

  .label-holder.purple {
    margin: -1px;
    color: $purple-300;
    background-color: rgba($purple-400, .1);
  }

  .label-holder.yellow {
    color: $yellow-5;
  }

  span.svg-icon.inline.lock {
    height: 12px;
    width: 10px;
    position: absolute;
    right: 8px;
    top: 8px;
    margin-top: 0;
    color: $gray-200;
  }

  span.badge.badge-round.badge-item.badge-clock {
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
    background-color: $purple-400;
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

  .w-0 {
    width: 0rem;
  }
</style>

<script>
import { v4 as uuid } from 'uuid';

export default {
  components: {
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
    owned: {
      type: Boolean,
      default: false,
    },
    labelClass: {
      type: String,
    },
  },
  data () {
    return Object.freeze({
      itemId: uuid(),
    });
  },
  computed: {
  },
  methods: {
    click () {
      this.$emit('click', {});
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
