<template lang="pug">
div
  .item-wrapper(@click="click()", :id="itemId")
    .item.pet-slot(
      :class="{'item-empty': !isOwned()}",
    )
      slot(name="itemBadge", :item="item")
      span.item-content(:class="itemClass()")
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
  import { mapState } from 'client/libs/store';
  import {isOwned} from '../../../libs/createAnimal';

  export default {
    props: {
      item: {
        type: Object,
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
    computed: {
      ...mapState({
        userItems: 'user.data.items',
      }),
    },
    methods: {
      click () {
        this.$emit('click', {});
      },
      isOwned () {
        return isOwned('mount', this.item, this.userItems);
      },
      itemClass () {
        return this.isOwned() ? `Mount_Icon_${this.item.key}` : 'PixelPaw GreyedOut';
      },
    },
  };
</script>
