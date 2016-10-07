<!-- Entry point component for the entire app -->

<template lang="pug">
#app.ui.fluid.container
  app-header
  router-view.view
</template>

<script>
import AppHeader from './components/appHeader';

export default {
  components: {
    AppHeader,
  },
};
</script>

<style lang="less">
// Load CSS that doesn't belong to any specific component
@import './assets/less/index';
</style>
