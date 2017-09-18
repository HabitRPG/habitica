<template lang="pug">
div
  .item-wrapper(:id="itemId")
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
  import bPopover from 'bootstrap-vue/lib/components/popover';
  import uuid from 'uuid';

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
  };
</script>
