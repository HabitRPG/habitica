<template lang="pug">
div
  .item-wrapper(@click="click()", :id="itemId")
    .item.pet-slot(
      :class="{'item-empty': emptyItem, 'highlight': highlightBorder}",
    )
      slot(name="itemBadge", :item="item")
      span.item-content.hatchAgain(v-if="mountOwned && isHatchable")
        span.egg(:class="eggClass")
        span.potion(:class="potionClass")
      span.item-content(v-else, :class="getPetItemClass(item)")
      span.pet-progress-background(v-if="item.isAllowedToFeed() && progress > 0")
        div.pet-progress-bar(v-bind:style="{width: 100 * progress/50 + '%' }")
    span.item-label(v-if="label") {{ label }}

  b-popover(
    :target="itemId",
    :triggers="showPopover ? 'hover' : ''",
    :placement="popoverPosition",
  )
    div.hatchablePopover(v-if="item.isHatchable()")
      h4.popover-content-title {{ item.name }}
      div.popover-content-text(v-html="$t('haveHatchablePet', { potion: item.potionName, egg: item.eggName })")
      div.potionEggGroup
        div.potionEggBackground
          div(:class="potionClass")
        div.potionEggBackground
          div(:class="eggClass")
    div(v-else)
      h4.popover-content-title {{ item.name }}

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

  .hatchAgain {
    display: inline-flex;
    align-items: center;

    width: 94px;
    height: 94px;

    .egg {
      position: absolute;
      left: 4px;
      top: 14px;
      z-index: 1;
      transform: scale(1.2);
    }

    .potion {
      position: absolute;
      right: 4px;
      top: 14px;
      transform: scale(1.2);
    }
  }
</style>

<script>
  import uuid from 'uuid';

  export default {
    props: {
      item: {
        type: Object,
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
    data () {
      return Object.freeze({
        itemId: uuid.v4(),
      });
    },
    methods: {
      click () {
        this.$emit('click', {});
      },
      getPetItemClass (pet) {
        if (this.mountOwned && !this.isHatchable) {
          return `GreyedOut Pet Pet-${pet.key} ${pet.eggKey}`;
        }

        if (this.isOwned) {
          return `Pet Pet-${pet.key} ${pet.eggKey}`;
        }

        if (this.isHatchable) {
          return 'PixelPaw';
        }

        if (this.mountOwned) {
          return `GreyedOut Pet Pet-${pet.key} ${pet.eggKey}`;
        }

        // Can't hatch
        return 'GreyedOut PixelPaw';
      },
    },
    computed: {
      potionClass () {
        return `Pet_HatchingPotion_${this.item.potionKey}`;
      },
      eggClass () {
        return `Pet_Egg_${this.item.eggKey}`;
      },
      isOwned () {
        return this.item.isOwned();
      },
      isHatchable () {
        return this.item.isHatchable();
      },
      mountOwned () {
        return this.item.mountOwned();
      },
    },
  };
</script>
