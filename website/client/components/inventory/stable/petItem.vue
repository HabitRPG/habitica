<template lang="pug">
b-popover(
  :triggers="[showPopover?'hover':'']",
  :placement="popoverPosition",
)
  span(slot="content")
    slot(name="popoverContent", :item="item")

  .item-wrapper(@click="click()")
    .item(
      :class="{'item-empty': emptyItem, 'highlight': highlightBorder}",
    )
      slot(name="itemBadge", :item="item")
      span.item-content(:class="itemContentClass")
      span.pet-progress-background(v-if="item.isAllowedToFeed() && progress > 0")
        div.pet-progress-bar(v-bind:style="{width: 100 * progress/50 + '%' }")
    span.item-label(v-if="label") {{ label }}
</template>

<style lang="scss">
  .pet-progress-background {
    width: 62px;
    height: 4px;
    background-color: #e1e0e3;
    position: absolute;
    bottom: 4px;
    left: calc((100% - 62px) / 2);
  }

  .pet-progress-bar {
    height: 4px;
    background-color: #24cc8f;
  }
</style>

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
      progress: {
        type: Number,
        default: -1,
      },
      emptyItem: {
        type: Boolean,
        default: false,
      },
      highlightBorder: {
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
    methods: {
      click () {
        this.$emit('click', {});
      },
    },
  };
</script>
