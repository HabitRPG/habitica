<!-- Entry point component for the entire app -->

<template lang="pug">
#app
  div(v-html="svg", v-once)
  app-menu
  .container-fluid
    app-header
    router-view
</template>

<script>
import AppMenu from './components/appMenu';
import AppHeader from './components/appHeader';
import svg from '!raw-loader!assets/svg/sheet.svg';

export default {
  name: 'app',
  components: {
    AppMenu,
    AppHeader,
  },
  data () {
    return {svg};
  },
};
</script>

<style src="bootstrap/scss/bootstrap.scss" lang="scss"></style>
<style src="assets/scss/index.scss" lang="scss"></style>
<style src="assets/css/index.css"></style>