<template>
  <div>
    <div
      :id="itemId"
      class="item-wrapper"
      @click="click()"
    >
      <div
        class="item pet-slot transition"
        :class="{'item-empty': !isOwned()}"
      >
        <slot
          name="itemBadge"
          :item="item"
        ></slot>
        <Sprite
          class="item-content"
          :class="itemClass()"
          :image-name="imageName()"
        />
      </div>
    </div>
    <b-popover
      v-if="showPopover"
      :target="itemId"
      triggers="hover"
      :placement="popoverPosition"
    >
      <slot
        name="popoverContent"
        :item="item"
      ></slot>
    </b-popover>
  </div>
</template>

<script>
import { v4 as uuid } from 'uuid';
import { mapState } from '@/libs/store';
import { isOwned } from '../../../libs/createAnimal';
import Sprite from '@/components/ui/sprite';

export default {
  components: {
    Sprite,
  },
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
      itemId: uuid(),
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
      return this.isOwned() ? '' : 'GreyedOut';
    },
    imageName () {
      return this.isOwned() ? `stable_Mount_Icon_${this.item.key}` : 'PixelPaw';
    },
  },
};
</script>
