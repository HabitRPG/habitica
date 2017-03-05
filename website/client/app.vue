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

<style src="bootstrap/scss/bootstrap.scss" lang="scss"></style>
<style src="assets/scss/index.scss" lang="scss"></style>
<style src="assets/css/index.css"></style>