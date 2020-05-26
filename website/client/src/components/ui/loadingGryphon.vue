<template>
  <div class="loading-gryphon-wrapper">
    <div
      v-once
      class="svg-icon loading-gryphon"
      :style="{width: `${width}px`, height: `${height}px`}"
      v-html="icons.gryphon"
    ></div>
  </div>
</template>

<style lang='scss' scoped>
  .loading-gryphon-wrapper {
    width: 100%;
    padding-top: 72px;
    padding-bottom: 72px;
  }

  .loading-gryphon {
    color: #6133b4;
    margin: 0 auto;
    animation: pulsate 2s linear infinite;
  }

  @keyframes pulsate {
    from { opacity: 1; }
    50% { opacity: 0.5; }
    to { opacity: 1; }
  }
</style>

<script>
import gryphon from '@/assets/svg/gryphon.svg';

export default {
  props: {
    height: {
      type: Number,
      default: 48,
    },
  },
  data () {
    return {
      icons: Object.freeze({
        gryphon,
      }),
    };
  },
  computed: {
    // The original SVG is 70px tall and 64px wide, we calculate the width based on that
    // in order to keep the right proportions
    width () {
      return (this.height / 70) * 64;
    },
  },
};
</script>
