<template lang="pug">
#app.ui.fluid.container
  site-header
  p Welcome back {{user.profile.name}} {{profileName}}!
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

  computed: {
    user () {
      return this.$store.state.user;
    },
    profileName () {
      return this.$store.getters.profileName;
    },
  },
};
</script>

<style lang="less">
@import '../assets/semantic-ui/semantic.less';

// Element is rendered outside of Vue because it cannot wait for JS to be loaded
// Placing CSS here so it benefits from pre-processing
#loading-screen {
  height: 100%;
}
</style>
