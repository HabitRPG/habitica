<template lang="pug">
div
  .item-wrapper(@click="click($event)", :id="itemId")
    .item(:class="{'item-active': active }")
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
  b-popover(
    :target="itemId",
    triggers="hover",
    placement="top",
  )
    h4.popover-content-title {{ item.text() }}
    div.popover-content-text(v-html="item.notes()")
</template>

<script>
import DragDropDirective from 'client/directives/dragdrop.directive';

import CountBadge from 'client/components/ui/countBadge';

import uuid from 'uuid';

export default {
  components: {
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
    active: {
      type: Boolean,
    },
  },
  data () {
    return Object.freeze({
      itemId: uuid.v4(),
    });
  },
  methods: {
    dragend ($event) {
      this.$emit('itemDragEnd', $event);
    },
    dragstart ($event) {
      this.$emit('itemDragStart', $event);
    },
    click ($event) {
      this.$emit('itemClick', $event);
    },
  },
};
</script>
