<template lang="pug">
div.slider-root(v-bind:class="{'scrollButtonsVisible': scrollButtonsVisible}")
  div.slider-button-area.left-button(
    v-if="scrollButtonsVisible",
    @mousedown.left="slidingLeft"
  )
    a.slider-button
      .svg-icon(v-html="icons.previous")
  div.slider-button-area.right-button(
    v-if="scrollButtonsVisible",
    @mousedown.left="slidingRight"
  )
    a.slider-button
      .svg-icon(v-html="icons.next")

  div.sliding-content
    .items.items-one-line
      slot(
        name="item",
        v-for="item in items",
        :item="item",
      )
</template>

<style lang="scss">

  @import '~client/assets/scss/colors.scss';

.slider-root {
  position: relative;
}

.slider-button {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: #ffffff;
  box-shadow: 0 2px 2px 0 rgba(26, 24, 29, 0.16), 0 1px 4px 0 rgba(26, 24, 29, 0.12);
  position: absolute;
  top: calc((100% - 40px) / 2);

  .svg-icon {
    color: #a5a1ac;
    margin: auto 0;
    position: absolute;
    top: calc((100% - 12px)/2);
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
  width: 50px;
  height: 100%;
  position: absolute;
  z-index: 2;

  &.left-button {
    left: 0;
    background: linear-gradient(to left, rgba(gray, 0.01), $gray-50);
  }

  &.right-button {
    right: 0;
    background: linear-gradient(to right, rgba(gray, 0.01), $gray-50);
  }
}

.items {
  padding-top: 10px;
  margin-left: 50px;
  margin-right: 50px;
}

</style>

<script>
  import previous from 'assets/svg/previous.svg';
  import next from 'assets/svg/next.svg';

  const SCROLL_STEPS = 75;

  export default {
    data () {
      return {
        icons: {
          previous,
          next,
        },
      };
    },
    methods: {
      slidingLeft () {
        let element = this.$el.querySelector('.sliding-content');

        element.scrollLeft -= SCROLL_STEPS;
      },

      slidingRight () {
        let element = this.$el.querySelector('.sliding-content');

        element.scrollLeft += SCROLL_STEPS;
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
    },
  };
</script>
