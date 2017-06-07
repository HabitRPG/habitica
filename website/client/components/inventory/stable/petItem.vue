<template lang="pug">
b-popover(
  :triggers="['hover']",
  :placement="popoverPosition",
)
  span(slot="content")
    slot(name="popoverContent", :item="item")

  .item-wrapper
    .item(
      :class="{'item-empty': emptyItem}",
      @touchend="holdStop",
      @touchstart="holdStart",
      @mouseup="holdStop",
      @mousedown.left="holdStart"
    )
      slot(name="itemBadge", :item="item")
      span.item-content(:class="itemContentClass")
      span.pet-progress-background(v-if="progress > 0")
        div.pet-progress-bar(v-bind:style="{width: 100 * progress/50 + '%' }")
      span.pet-progress-background(v-if="holdProgress > 0")
        div.pet-progress-bar.hold(v-bind:style="{width: 100 * holdProgress/5 + '%' }")
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

  .pet-progress-bar.hold {
    background-color: #54c3cc;
  }
</style>

<script>
  import bPopover from 'bootstrap-vue/lib/components/popover';
  import {mapState} from 'client/libs/store';

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
      popoverPosition: {
        type: String,
        default: 'bottom',
      },
    },
    data () {
      return {
        holdProgress: -1,
      };
    },
    computed: {
      ...mapState({
        ATTRIBUTES: 'constants.ATTRIBUTES',
      }),
    },
    methods: {
      holdStart () {
        let pet = this.item;
        if (pet.isOwned() || !pet.isHatchable()) {
          return;
        }

        this.holdProgress = 1;

        this.currentHoldingTimer = setInterval(() => {
          if (this.holdProgress === 5) {
            this.holdStop();
            this.$emit('hatchPet', pet);
          }

          this.holdProgress += 1;
        }, 1000);
      },
      holdStop () {
        if (this.currentHoldingTimer) {
          clearInterval(this.currentHoldingTimer);
          this.holdProgress = -1;
        }
      },
    },
  };
</script>
