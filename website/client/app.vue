<!-- Entry point component for the entire app -->

<template lang="pug">
#app
  app-menu
  .ui.grid.fluid
    app-header
    router-view
</template>

<script>
import AppMenu from './components/appMenu';
import AppHeader from './components/appHeader';

export default {
  components: {
    AppMenu,
    AppHeader,
  },
};
</script>

<style lang="less">
// Load CSS that doesn't belong to any specific component
@import '../client-old/css/habitrpg-shared.css';
@import './assets/less/index';
</style>
