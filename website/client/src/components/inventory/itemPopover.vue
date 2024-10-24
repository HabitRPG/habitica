<template>
  <div
    ref="root"
    v-if="draggedItem"
    class="draggedItemInfo mouse"
    v-mousePosition="30"
    @mouseMoved="mouseMoved($event)">
      <Sprite
        class="dragging-icon"
        :image-name="imageName()"
      />
      <div class="popover">
        <div
          class="popover-content"
        >
          {{ $t(popoverTextKey, { [translationKey]: itemText() }) }}
        </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
  .draggedItemInfo {
    position: absolute;
    left: -500px;

    z-index: 1080;

    &.mouse {
      position: fixed;
      pointer-events: none
    }

    .dragging-icon {
      width: 68px;
      margin: 0 auto 8px;
      display: block;
      transform: scale(1.5);
    }

    .popover {
      position: static;
      width: 180px;
    }

    .popover-content {
      color: white;
      margin: 15px;
      text-align: center;
    }
  }
</style>

<script>
import Sprite from '@/components/ui/sprite';
import MouseMoveDirective from '@/directives/mouseposition.directive';

export default {
  name: 'ItemPopover',
  components: {
    Sprite,
  },
  directives: {
    mousePosition: MouseMoveDirective,
  },
  props: {
    draggedItem: {
      type: Object,
      default: null,
    },
    popoverTextKey: {
      type: String,
      default: '',
    },
    translationKey: {
      type: String,
      default: '',
    },
  },
  methods: {
    imageName () {
      if (this.draggedItem) {
        if (this.draggedItem.class) {
          return this.draggedItem.class;
        }
        if (this.draggedItem.target) {
          return `Pet_Food_${this.draggedItem.key}`;
        }
      }
      return '';
    },
    mouseMoved ($event) {
      if (this.$refs.root) {
        this.$refs.root.style.left = `${$event.x - 60}px`;
        this.$refs.root.style.top = `${$event.y + 10}px`;
      }
    },
    itemText () {
      if (this.draggedItem) {
        if (this.draggedItem.text) {
          if (typeof this.draggedItem.text === 'function') {
            return this.draggedItem.text();
          }
          return this.draggedItem.text;
        }
        return this.draggedItem.class;
      }
      return '';
    },
  },
};

</script>
