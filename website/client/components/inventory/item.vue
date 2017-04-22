<template lang="pug">
b-popover(
  :triggers="['hover']",
  placement="top",
  offset="-6px 0",
  v-if="item && item.key.indexOf('_base_0') === -1"
)
  span(slot="content")
    h4.popover-content-title {{ item.text() }}
    .popover-content-text {{ item.notes() }}
    .popover-content-attr(v-for="attr in ATTRIBUTES") 
      span.popover-content-attr-key {{ `${$t(attr)}: ` }}
      span.popover-content-attr-val {{ `+${item[attr]}` }}

  .item-wrapper
    .item
      span.badge.badge-pill(
        :class="{'item-selected-badge': selected === true}",
        @click="click",
      ) &#9733;
      span.item-content(:class="'shop_' + item.key")
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
    selected: {
      type: Boolean,
    },
    label: {
      type: String,
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