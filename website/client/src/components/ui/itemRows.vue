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
      <p
        v-if="clickHandler"
        class="empty-state"
        @click.stop.prevent="$emit('emptyClick', $event)"
        v-html="noItemsLabel"
      >
      </p>
      <p
        v-else
        class="empty-state"
        v-html="noItemsLabel"
      >
      </p>
    </div>
    <show-more-button
      v-if="foldButton && items.length > itemsPerRow"
      :show-all="showAll"
      @click="toggleItemsToShow()"
    />
  </div>
</template>

<style lang="scss" scoped>
  @import '~@/assets/scss/colors.scss';

  .btn-show-more {
    max-width: 920px;
  }

  .empty-state {
    color: $gray-100;
  }

  .item-rows {
    max-width: 944px;
  }
</style>

<script>
import _take from 'lodash/take';
import ResizeDirective from '@/directives/resize.directive';
import openedItemRowsMixin from '@/mixins/openedItemRows';
import ShowMoreButton from '@/components/ui/showMoreButton';

export default {
  components: { ShowMoreButton },
  directives: {
    resize: ResizeDirective,
  },
  mixins: [openedItemRowsMixin],
  props: {
    clickHandler: {
      type: Boolean,
      default: true,
    },
    foldButton: {
      type: Boolean,
      default: true,
    },
    itemMargin: {
      type: Number,
    },
    itemWidth: {
      type: Number,
    },
    items: {
      type: Array,
    },
    maxItemsPerRow: {
      type: Number,
    },
    noItemsLabel: {
      type: String,
    },
    type: {
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
      if (this.maxItemsPerRow > 0) {
        return this.maxItemsPerRow;
      }
      return Math.floor(this.currentWidth / (this.itemWidth + this.itemMargin));
    },
  },
  created () {
    this.showAll = this.$_openedItemRows_isToggled(this.type) || !this.foldButton;
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
