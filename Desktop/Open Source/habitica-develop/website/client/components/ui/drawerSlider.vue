<template lang="pug">
  div.slider-root(
    v-bind:class="{'scrollButtonsVisible': scrollButtonsVisible}",
  )
    div.slider-button-area.left-button(
      v-if="scrollButtonsVisible",
      @mousedown.left="lastPage"
    )
      a.slider-button
        .svg-icon(v-html="icons.previous")
    div.slider-button-area.right-button(
      v-if="scrollButtonsVisible",
      @mousedown.left="nextPage"
    )
      a.slider-button
        .svg-icon(v-html="icons.next")

    // 120 = width of the left/right buttons
    div.sliding-content(v-resize="500", @resized="currentWidth = $event.width - 120")
      .items.items-one-line
        template(v-for="item in pages[currentPage]")
          div.vertical-divider(v-if="item.ofNextPage")

          slot(
            name="item",
            :item="item",
          )
</template>

<style lang="scss">

  @import '~client/assets/scss/colors.scss';

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
    padding-top: 10px;
    margin-left: $buttonAreaWidth+ px;

    & > div:last-of-type {
      margin-right: $buttonAreaWidth + 20px;
    }
  }

  .vertical-divider {
    height: 92px;
    width: 1px;
    background: #34313a;
    margin-bottom: 8px;
  }

</style>

<script>
  import previous from 'assets/svg/previous.svg';
  import next from 'assets/svg/next.svg';
  import ResizeDirective from 'client/directives/resize.directive';

  import _chunk from 'lodash/chunk';

  export default {
    directives: {
      resize: ResizeDirective,
    },
    data () {
      return {
        icons: Object.freeze({
          previous,
          next,
        }),
        currentWidth: 0,
        currentPage: 0,
      };
    },
    computed: {
      pages () {
        return _chunk(this.items, this.itemsPerPage() - 1).map((content, index, array) => {
          let resultData = [...content];

          if (array[index + 1]) {
            resultData.push({
              ...array[index + 1][0],
              ofNextPage: true,
            });
          }

          return resultData;
        });
      },
    },
    methods: {
      lastPage () {
        if (this.currentPage > 0) {
          this.currentPage--;
        } else {
          this.currentPage = this.pages.length - 1;
        }
      },

      nextPage () {
        if (this.currentPage < this.pages.length - 1) {
          this.currentPage++;
        } else {
          this.currentPage = 0;
        }
      },

      itemsPerPage () {
        return Math.floor(this.currentWidth / (this.itemWidth + this.itemMargin));
      },
    },
    props: {
      scrollButtonsVisible: {
        type: Boolean,
        default: true,
      },
      items: {
        type: Array,
      },
      itemWidth: {
        type: Number,
      },
      itemMargin: {
        type: Number,
      },
    },
  };
</script>
