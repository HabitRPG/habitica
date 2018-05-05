<template lang="pug">
div
  .item-wrapper(@click="click()", :id="itemId")
    .item(
      :class="{'item-empty': emptyItem}",
    )
      slot(name="itemBadge", :item="item")
      span.item-content(:class="itemContentClass")
  b-popover(
    :target="itemId",
    v-if="showPopover",
    triggers="hover",
    :placement="popoverPosition",
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
    },
    data () {
      return Object.freeze({
        itemId: uuid.v4(),
      });
    },
    methods: {
      click () {
        this.$emit('click', {});
      },
    },
  };
</script>
