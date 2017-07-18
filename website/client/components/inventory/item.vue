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
)
  span(slot="content")
    slot(name="popoverContent", :item="item")

  .item-wrapper(@click="click")
    .item
      slot(name="itemBadge", :item="item")
      span.item-content(
        :class="itemContentClass"
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
  },
  methods: {
    click () {
      this.$emit('click', this.item);
    },
  },
};
</script>
