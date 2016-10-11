<!-- Entry point component for the entire app -->

<template lang="pug">
#app
  app-header
  .ui.grid.fluid
    .row
      router-view
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

#app-body {
  margin-top: 3em;
}
</style>
