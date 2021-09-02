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
    <show-more-button
      v-if="items.length > itemsPerRow"
      :show-all="showAll"
      @click="toggleItemsToShow()"
    />
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
    margin-right: -1.5rem;
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
