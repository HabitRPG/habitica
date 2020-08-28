<template>
  <div v-if="emptyItem">
    <div class="item-wrapper">
      <div class="item transition item-empty">
        <div class="item-content"></div>
      </div><span
        v-if="label"
        class="item-label"
      >{{ label }}</span>
    </div>
  </div><div v-else>
    <div
      :id="itemId"
      class="item-wrapper"
      @click="click"
    >
      <div
        class="item transition"
        :class="{'item-active': active, 'highlight-border':highlightBorder }"
      >
        <slot
          name="itemBadge"
          :item="item"
        ></slot><span
          class="item-content"
          :class="itemContentClass"
        ></span>
      </div><span
        v-if="label"
        class="item-label"
      >{{ label }}</span>
    </div><b-popover
      v-if="showPopover"
      :target="itemId"
      triggers="hover"
      :placement="popoverPosition"
      :prevent-overflow="false"
    >
      <slot
        name="popoverContent"
        :item="item"
      ></slot>
    </b-popover>
  </div>
</template>

<script>
import { v4 as uuid } from 'uuid';

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
      itemId: uuid(),
    });
  },
  methods: {
    click () {
      this.$emit('click', this.item);
    },
  },
};
</script>
