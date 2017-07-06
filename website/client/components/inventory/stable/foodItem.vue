<template lang="pug">
b-popover(
  :triggers="['hover']",
  :placement="'top'",
)
  span(slot="content")
    h4.popover-content-title {{ item.text() }}
    div.popover-content-text(v-html="item.notes()")

  .item-wrapper
    .item
      countBadge(
        :show="true",
        :count="itemCount"
      )
      span.item-content(
        :class="'Pet_Food_'+item.key",
        v-drag.food="item.key",
        @itemDragEnd="dragend($event)",
        @itemDragStart="dragstart($event)"
      )
</template>

<script>
import bPopover from 'bootstrap-vue/lib/components/popover';
import DragDropDirective from 'client/directives/dragdrop.directive';

import CountBadge from './countBadge';

export default {
  components: {
    bPopover,
    CountBadge,
  },
  directives: {
    drag: DragDropDirective,
  },
  props: {
    item: {
      type: Object,
    },
    itemCount: {
      type: Number,
    },
    itemContentClass: {
      type: String,
    },
  },
  methods: {
    dragend ($event) {
      this.$emit('itemDragEnd', $event);
    },
    dragstart ($event) {
      this.$emit('itemDragStart', $event);
    },
  },
};
</script>
