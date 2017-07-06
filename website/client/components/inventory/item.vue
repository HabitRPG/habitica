<template lang="pug">
div(v-if="emptyItem")
  .item-wrapper
    .item.item-empty
      .item-content
    span.item-label(v-if="label") {{ label }}
b-popover(
  v-else,
  :triggers="['hover']",
  :placement="popoverPosition",
  @click="click",
)
  span(slot="content")
    slot(name="popoverContent", :item="item")

  .item-wrapper
    .item
      slot(name="itemBadge", :item="item")
      span.item-content(
        :class="itemContentClass",
        :draggable="draggable",
        @dragstart="onDrag"
      )
    span.item-label(v-if="label") {{ label }}
</template>

<script>
import bPopover from 'bootstrap-vue/lib/components/popover';

export default {
  components: {
    bPopover,
  },
  props: {
    item: {
      type: Object,
    },
    itemContentClass: {
      type: String,
    },
    label: {
      type: String,
    },
    emptyItem: {
      type: Boolean,
      default: false,
    },
    popoverPosition: {
      type: String,
      default: 'bottom',
    },
    draggable: {
      type: Boolean,
      default: false,
    },
  },
  methods: {
    click () {
      this.$emit('click', this.item);
    },
    onDrag (ev) {
      if (this.draggable) {
        this.$emit('onDrag', ev);
      } else {
        ev.preventDefault();
      }
    },
  },
};
</script>
