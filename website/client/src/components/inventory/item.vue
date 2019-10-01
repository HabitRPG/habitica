<template lang="pug">
div(v-if="emptyItem")
  .item-wrapper
    .item.item-empty
      .item-content
    span.item-label(v-if="label") {{ label }}
div(v-else)
  .item-wrapper(@click="click", :id="itemId")
    .item(:class="{'item-active': active, 'highlight-border':highlightBorder }")
      slot(name="itemBadge", :item="item")
      span.item-content(
        :class="itemContentClass"
      )
    span.item-label(v-if="label") {{ label }}
  b-popover(
    v-if="showPopover"
    :target="itemId",
    triggers="hover",
    :placement="popoverPosition",
    :preventOverflow="false",
  )
    slot(name="popoverContent", :item="item")
</template>

<script>
import uuid from 'uuid';

export default {
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
    showPopover: {
      type: Boolean,
      default: true,
    },
    active: {
      type: Boolean,
    },
    highlightBorder: {
      type: Boolean,
    },
  },
  data () {
    return Object.freeze({
      itemId: uuid.v4(),
    });
  },
  methods: {
    click () {
      this.$emit('click', this.item);
    },
  },
};
</script>
