<template lang="pug">
#app
  router-view(v-if="!isUserLoggedIn || isStaticPage")
  template(v-else)
    #loading-screen.h-100.w-100.d-flex.justify-content-center.align-items-center(v-if="!isUserLoaded")
      p Loading...
    template(v-else)
      notifications
      app-menu
      .container-fluid
        app-header
        router-view
        app-footer
</template>

<script>
import AppMenu from './components/appMenu';
import AppHeader from './components/appHeader';
import AppFooter from './components/appFooter';
import notifications from './components/notifications';
import { mapState } from 'client/libs/store';

export default {
  name: 'app',
  components: {
    AppMenu,
    AppHeader,
    AppFooter,
    notifications,
  },
  data () {
    return {
      isUserLoaded: false,
    };
  },
  computed: {
    ...mapState(['isUserLoggedIn']),
    isStaticPage () {
      return this.$route.meta.requiresLogin === false ? true : false;
    },
  },
  created () {
    // Setup listener for title
    this.$store.watch(state => state.title, (title) => {
      document.title = title;
    });

    if (this.isUserLoggedIn && !this.isStaticPage) {
      // Load the user and the user tasks
      Promise.all([
        this.$store.dispatch('user:fetch'),
        this.$store.dispatch('tasks:fetchUserTasks'),
      ]).then(() => {
        this.isUserLoaded = true;
      }).catch((err) => {
        console.error('Impossible to fetch user. Clean up localStorage and refresh.', err); // eslint-disable-line no-console
      });
    }
  },
};
</script>

<style src="bootstrap/scss/bootstrap.scss" lang="scss"></style>
<style src="assets/scss/index.scss" lang="scss"></style>
<style src="assets/css/index.css"></style>
