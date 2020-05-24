<template>
  <div class="loading-gryphon-wrapper">
    <div
      v-once
      class="svg-icon loading-gryphon"
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
    width: 65px;
    height: 70px;
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
  data () {
    return {
      icons: Object.freeze({
        gryphon,
      }),
    };
  },
};
</script>
