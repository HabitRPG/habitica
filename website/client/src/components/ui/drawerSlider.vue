<template>
  <div class="slider-root">
    <div
      v-if="scrollButtonsVisible()"
      class="slider-button-area left-button"
      @mousedown.left="shiftRight"
    >
      <a class="slider-button">
        <div
          class="svg-icon"
          v-html="icons.previous"
        ></div>
      </a>
    </div>
    <div
      v-if="scrollButtonsVisible()"
      class="slider-button-area right-button"
      @mousedown.left="shiftLeft"
    >
      <a class="slider-button">
        <div
          class="svg-icon"
          v-html="icons.next"
        ></div>
      </a>
    </div>
    <!-- 120 = width of the left/right buttons-->
    <div
      v-resize="500"
      class="sliding-content"
      @resized="currentWidth = $event.width - 120"
    >
      <div class="items items-one-line">
        <template
          v-for="item in showItems"
        >
          <div
            v-if="shouldAddVerticalLine(item)"
            :key="item.key"
            class="vertical-divider"
            :style="dividerMargins"
          ></div>
          <slot
            name="item"
            :item="item"
          ></slot>
        </template>
      </div>
    </div>
  </div>
</template>

<style lang="scss">

  @import '~@/assets/scss/colors.scss';

  $buttonAreaWidth: 60;

  .slider-root {
    position: relative;
  }

  .slider-button {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background-color: #ffffff;
    box-shadow: 0 2px 2px 0 rgba($black, 0.16), 0 1px 4px 0 rgba($black, 0.12);
    position: absolute;
    top: calc((100% - 40px) / 2);

    .svg-icon {
      color: #a5a1ac;
      margin: auto 0;
      position: absolute;
      top: calc((100% - 12px) / 2);
      width: 8px;
      height: 16px;
      right: 16px;
    }
  }

  .scrollButtonsVisible {

    .sliding-content {
      overflow: hidden;
    }
  }

  .slider-button-area {
    width: $buttonAreaWidth+px;
    height: 100%;
    position: absolute;
    z-index: 2;

    &.left-button {
      left: 0;
    }

    &.right-button {
      right: 0;
    }
  }

  .sliding-content .items {
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    padding-top: 10px;
    margin-left: $buttonAreaWidth+ px;
    margin-right: $buttonAreaWidth+ px;
  }

  .vertical-divider {
    height: 92px;
    width: 1px;
    background: #34313a;
    margin-bottom: 8px;
  }

</style>

<script>
import previous from '@/assets/svg/previous.svg';
import next from '@/assets/svg/next.svg';
import ResizeDirective from '@/directives/resize.directive';

export default {
  directives: {
    resize: ResizeDirective,
  },
  props: {
    items: {
      type: Array,
    },
    itemType: {
      type: Number,
    },
    itemWidth: {
      type: Number,
    },
    itemMargin: {
      type: Number,
    },
  },
  data () {
    return {
      icons: Object.freeze({
        previous,
        next,
      }),
      currentWidth: 0,
      pointer: 0,
    };
  },
  computed: {
    showItems () {
      const { items } = this;
      const { pointer } = this;
      const itemsPerPage = this.itemsPerPage();
      const firstSlice = items.slice(pointer, pointer + itemsPerPage);

      if (firstSlice.length === itemsPerPage || items.length < itemsPerPage) {
        return firstSlice;
      }
      const getRemainderItems = itemsPerPage - firstSlice.length;
      const secondSlice = items.slice(0, getRemainderItems);

      return firstSlice.concat(secondSlice);
    },
    dividerMargins () {
      return {
        marginLeft: `${-this.itemMargin / 2}px`,
        marginRight: `${this.itemMargin / 2}px`,
      };
    },
  },
  watch: {
    itemType () {
      this.pointer = 0;
    },
  },
  methods: {
    shiftLeft () {
      if (this.pointer < this.items.length - 1) {
        this.pointer += 1;
      } else {
        this.pointer = 0;
      }
    },
    shiftRight () {
      if (this.pointer > 0) {
        this.pointer -= 1;
      } else {
        this.pointer = this.items.length - 1;
      }
    },
    itemsPerPage () {
      return Math.floor(this.currentWidth / (this.itemWidth + this.itemMargin));
    },
    shouldAddVerticalLine (item) {
      return this.items[this.itemsPerPage() - 1] === item && this.pointer !== 5;
    },
    scrollButtonsVisible () {
      return this.items.length > this.itemsPerPage();
    },
  },
};
</script>
