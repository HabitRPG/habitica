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
        <span
          v-drag.food="item.key"
          class="item-content"
          :class="'Pet_Food_'+item.key"
          @itemDragEnd="dragend($event)"
          @itemDragStart="dragstart($event)"
        ></span>
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

import CountBadge from '@/components/ui/countBadge';

export default {
  components: {
    CountBadge,
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
