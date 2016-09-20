<template lang="pug">
#app
  site-header
  ul
    li
      router-link(to='/') Home
    li
      router-link(to='/page') Another Page
  router-view.view
</template>

<script>
import SiteHeader from './siteHeader';

export default {
  components: {
    SiteHeader,
  },
};
</script>

<style>
#app {
  margin: 0 auto;
  width: 80%;
  border-left : 1px solid;
  border-right: 1px solid;
  padding: 20px;
}
</style>
