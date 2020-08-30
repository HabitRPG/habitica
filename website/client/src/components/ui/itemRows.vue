<template>
  <div class="item-rows">
    <div
      v-resize="500"
      class="items"
      @resized="setCurrentWidth($event)"
    >
      <template v-for="item in itemsToShow(showAll)">
        <slot
          name="item"
          :item="item"
        ></slot>
      </template>
    </div>
    <div v-if="items.length === 0">
      <p v-once>
        {{ noItemsLabel }}
      </p>
    </div>
    <div
      v-if="items.length > itemsPerRow"
      class="btn btn-flat btn-show-more mb-4"
      @click="toggleItemsToShow()"
    >
      <span class="button-text">
        {{ showAll ? $t('showLess') : $t('showMore') }}
      </span>
    </div>
    <div
      v-else
      class="fill-height"
    ></div>
  </div>
</template>

<style lang="scss" scoped>
  @import '~@/assets/scss/colors.scss';

  .fill-height {
    height: 38px; // button + margin + padding
  }

  .item-rows {
    margin-right: -24px;
  }

  .btn-show-more {
    height: 2rem;
    padding-top: 0.25rem;
    padding-bottom: 0.25rem;
    border-radius: 2px;

    .button-text {
       height: 1.5rem;
       font-size: 14px;
       font-weight: bold;
       line-height: 1.71;
       text-align: center;
       color: $gray-100;
    }

    &:hover {
      .button-text {
        color: $purple-300;
      }
    }
  }
</style>

<script>
import _take from 'lodash/take';
import ResizeDirective from '@/directives/resize.directive';
import openedItemRowsMixin from '@/mixins/openedItemRows';


export default {
  directives: {
    resize: ResizeDirective,
  },
  mixins: [openedItemRowsMixin],
  props: {
    items: {
      type: Array,
    },
    type: {
      type: String,
    },
    itemWidth: {
      type: Number,
    },
    itemMargin: {
      type: Number,
    },
    noItemsLabel: {
      type: String,
    },
  },
  data () {
    return {
      currentWidth: 0,
      currentPage: 0,

      showAll: false,
    };
  },
  computed: {
    itemsPerRow () {
      return Math.floor(this.currentWidth / (this.itemWidth + this.itemMargin));
    },
  },
  created () {
    this.showAll = this.$_openedItemRows_isToggled(this.type);
  },
  methods: {
    toggleItemsToShow () {
      this.showAll = !this.showAll;

      this.$_openedItemRows_toggleByType(this.type, this.showAll);
    },
    itemsToShow (showAll) {
      const itemsLength = this.items.length;

      if (itemsLength === 0) return [];

      const { itemsPerRow } = this;

      if (showAll || itemsLength <= itemsPerRow) {
        return this.items;
      }

      return _take(this.items, itemsPerRow);
    },
    setCurrentWidth ($event) {
      if (this.currentWidth !== $event.width) {
        this.currentWidth = $event.width;
      }
    },
  },
};
</script>
