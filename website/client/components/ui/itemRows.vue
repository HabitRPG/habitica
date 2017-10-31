<template lang="pug">
  .item-rows
    div.items(v-resize="500", @resized="setCurrentWidth($event)")
      template(v-for="item in itemsToShow(showAll)")
        slot(
          name="item",
          :item="item"
        )

    div(v-if="items.length === 0")
      p(v-once) {{ noItemsLabel }}

    .btn.btn-flat.btn-show-more(
      @click="toggleItemsToShow()",
      v-if="items.length > itemsPerRow"
    ) {{ showAll ? $t('showLess') : $t('showMore') }}

    div.fill-height(v-else)

</template>

<style lang="scss" scoped>
  .fill-height {
    height: 38px; // button + margin + padding
  }

  .item-rows {
    margin-right: -24px;
  }
</style>

<script>
  import ResizeDirective from 'client/directives/resize.directive';
  import openedItemRowsMixin from 'client/mixins/openedItemRows';

  import _take from 'lodash/take';

  export default {
    mixins: [openedItemRowsMixin],
    directives: {
      resize: ResizeDirective,
    },
    computed: {
      itemsPerRow () {
        return Math.floor(this.currentWidth / (this.itemWidth + this.itemMargin));
      },
    },
    data () {
      return {
        currentWidth: 0,
        currentPage: 0,

        showAll: false,
      };
    },
    methods: {
      toggleItemsToShow () {
        this.showAll = !this.showAll;

        this.$_openedItemRows_toggleByType(this.type, this.showAll);
      },
      itemsToShow (showAll) {
        let itemsLength = this.items.length;

        if (itemsLength === 0)
          return [];

        let itemsPerRow = this.itemsPerRow;

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
    created () {
      this.showAll = this.$_openedItemRows_isToggled(this.type);
    },
  };
</script>
