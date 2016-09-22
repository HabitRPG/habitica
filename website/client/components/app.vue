<template lang="pug">
#app
  site-header
  p Welcome back {{user.profile.name}}
  ul
    li
      router-link(to='/') Home
    li
      router-link(to='/page') Another Page
  router-view.view
</template>

<script>
import SiteHeader from './siteHeader';
import { mapState } from 'vuex';

export default {
  components: {
    SiteHeader,
  },

  computed: mapState(['user']),
};
</script>

<style>
html, body {
  width: 100%;
  height: 100%;
  margin: 0;
  padding: 0;
}

#loading-screen { /* outside Vue because can't wait for rendering to finish */
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  background: #fff;
  z-index: 10001;
}

#app {
  margin: 0 auto;
  width: 80%;
  border-left : 1px solid;
  border-right: 1px solid;
  padding: 20px;
}
</style>
