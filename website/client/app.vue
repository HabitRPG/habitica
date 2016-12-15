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
  name: 'app',
  components: {
    AppMenu,
    AppHeader,
  },
};
</script>

<!-- Load CSS that doesn't belong to any specific component -->
<style src="assets/css/index.css"></style>
<style src="assets/less/index.less" lang="less"></style>

<style scoped>
.ui.fixed.menu + .ui.grid {
  padding-top: 0px;
}

.ui.grid {
  margin-top: 0px;
}
</style>