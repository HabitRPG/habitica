<template lang="pug">
b-popover(
  :triggers="['hover']",
  :placement="popoverPosition",
  v-if="showPopover",
)
  span(slot="content")
    slot(name="popoverContent", :item="item")

  .item-wrapper
    .item
      span.badge.badge-pill(
        :class="{'item-selected-badge': selected === true}",
        @click="click",
        v-if="starVisible"
      ) &#9733;
      span.item-content(:class="itemContentClass")
    span.item-label(v-if="label") {{ label }}
div(v-else)
  .item-wrapper
    .item.item-empty
      .item-content
    span.item-label(v-if="label") {{ label }}

</template>

<script>
import bPopover from 'bootstrap-vue/lib/components/popover';
import { mapState } from 'client/libs/store';

export default {
  components: {
    bPopover,
  },
  props: {
    item: {
      type: Object,
    },
    itemContentClass: {
      type: String
    },
    selected: {
      type: Boolean,
    },
    starVisible: {
      type: Boolean,
    },
    label: {
      type: String,
    },
    showPopover: {
      type: Boolean,
      default: true,
    },
    popoverPosition: {
      type: String,
      default: 'bottom',
    },
  },
  computed: {
    ...mapState({
      ATTRIBUTES: 'constants.ATTRIBUTES',
    }),
  },
  methods: {
    click () {
      this.$emit('click', this.item);
    },
  },
};
</script>
