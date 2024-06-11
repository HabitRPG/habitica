<template>
  <div>
    <div
      :id="itemId"
      class="item-wrapper"
      @click="click($event)"
    >
      <div
        class="item transition"
        :class="{'item-active': active }"
      >
        <countBadge
          :show="true"
          :count="itemCount"
        />
        <Sprite
          v-drag.food="item.key"
          class="item-content"
          :image-name="`Pet_Food_${item.key}`"
          @itemDragEnd="dragend($event)"
          @itemDragStart="dragstart($event)"
        />
      </div>
    </div>
    <b-popover
      :target="itemId"
      triggers="hover"
      placement="top"
    >
      <h4 class="popover-content-title">
        {{ itemName || item.text() }}
      </h4>
      <div
        class="popover-content-text"
        v-html="item.notes()"
      ></div>
    </b-popover>
  </div>
</template>

<script>
import { v4 as uuid } from 'uuid';
import DragDropDirective from '@/directives/dragdrop.directive';
import Sprite from '@/components/ui/sprite';

import CountBadge from '@/components/ui/countBadge';

export default {
  components: {
    CountBadge,
    Sprite,
  },
  directives: {
    drag: DragDropDirective,
  },
  props: {
    item: {
      type: Object,
    },
    itemCount: {
      type: Number,
    },
    itemContentClass: {
      type: String,
    },
    itemName: {
      type: String,
    },
    active: {
      type: Boolean,
    },
  },
  data () {
    return Object.freeze({
      itemId: uuid(),
    });
  },
  methods: {
    dragend ($event) {
      this.$emit('itemDragEnd', $event);
    },
    dragstart ($event) {
      this.$emit('itemDragStart', $event);
    },
    click ($event) {
      this.$emit('itemClick', $event);
    },
  },
};
</script>
