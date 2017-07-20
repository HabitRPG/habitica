<template lang="pug">
b-popover(
  :triggers="[showPopover?'hover':'']",
  :placement="popoverPosition",
)
  span(slot="content")
    slot(name="popoverContent", :item="item")

  .item-wrapper
    .item(
      :class="{'item-empty': emptyItem}",
    )
      slot(name="itemBadge", :item="item")
      span.item-content(:class="itemContentClass")
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
  };
</script>
