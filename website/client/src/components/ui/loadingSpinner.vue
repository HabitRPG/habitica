<template>
  <div
    v-once
    class="loading-spinner"
    role="text"
    :aria-label="$t('loading')"
  >
    <div></div>
    <div></div>
    <div></div>
  </div>
</template>

<style lang='scss' scoped>
  @import '~@/assets/scss/colors.scss';

  // NOTE: the loader is currently set to work inside standard buttons
  // To properly work outside of them some abstraction will be needed
  // for the height and width

  // Original CSS from https://loading.io/css/ released under the CC0 License

  .loading-spinner {
    width: 20px;
    height: 20px;
    margin-top: 1.5px;
    margin-bottom: 1.5px;
  }

  .loading-spinner div {
    box-sizing: border-box;
    display: block;
    position: absolute;
    width: 20px;
    height: 20px;
    border: 2px solid $white;
    border-radius: 50%;
    animation: loading-spinner 1.2s cubic-bezier(0.5, 0, 0.5, 1) infinite;
    border-color: $white transparent transparent transparent;
  }

  .loading-spinner div:nth-child(1) {
    animation-delay: -0.45s;
  }
  .loading-spinner div:nth-child(2) {
    animation-delay: -0.3s;
  }
  .loading-spinner div:nth-child(3) {
    animation-delay: -0.15s;
  }

  @keyframes loading-spinner {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }
</style>
