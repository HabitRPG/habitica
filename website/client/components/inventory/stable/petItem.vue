<template lang="pug">
  div
    .item-wrapper(@click="click()", :id="itemId")
      .item.pet-slot(
      :class="{'item-empty': !isOwned(), 'highlight': highlightBorder}",
      )
        slot(name="itemBadge", :item="item")
        span.item-content.hatchAgain(v-if="mountOwned() && isHatchable() && !item.isSpecial()")
          span.egg(:class="eggClass")
          span.potion(:class="potionClass")
        span.item-content(v-else, :class="getPetItemClass()")
        span.pet-progress-background(v-if="isAllowedToFeed() && progress() > 0")
          div.pet-progress-bar(v-bind:style="{width: 100 * progress()/50 + '%' }")
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
  import { mapState } from 'client/libs/store';
  import {isAllowedToFeed, isHatchable, isOwned, isSpecial} from '../../../libs/createAnimal';

  export default {
    props: {
      item: {
        type: Object,
      },
      label: {
        type: String,
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
      isOwned () {
        return isOwned('pet', this.item, this.userItems);
      },
      isAllowedToFeed () {
        return isAllowedToFeed(this.item, this.userItems);
      },
      getPetItemClass () {
        if (this.isOwned() || this.mountOwned() && this.isHatchable()) {
          return `Pet Pet-${this.item.key} ${this.item.eggKey}`;
        }

        if (!this.isOwned() && this.isSpecial()) {
          return 'GreyedOut PixelPaw';
        }

        if (this.isHatchable()) {
          return 'PixelPaw';
        }

        if (this.mountOwned()) {
          return `GreyedOut Pet Pet-${this.item.key} ${this.item.eggKey}`;
        }

        // Can't hatch
        return 'GreyedOut PixelPaw';
      },
      progress () {
        return this.userItems.pets[this.item.key];
      },
      // due to some state-refresh issues these methods are needed,
      // the computed-properties just didn't refresh on each state-change
      isHatchable () {
        return isHatchable(this.item, this.userItems);
      },
      mountOwned () {
        return isOwned('mount', this.item, this.userItems);
      },
      isSpecial () {
        return isSpecial(this.item);
      },
    },
    computed: {
      ...mapState({
        userItems: 'user.data.items',
      }),
      potionClass () {
        return `Pet_HatchingPotion_${this.item.potionKey}`;
      },
      eggClass () {
        return `Pet_Egg_${this.item.eggKey}`;
      },
    },
  };
</script>
