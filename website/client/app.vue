<template lang="pug">
#app
  notifications
  router-view(v-if="!isUserLoggedIn || isStaticPage")
  template(v-else)
    #loading-screen.h-100.w-100.d-flex.justify-content-center.align-items-center(v-if="!isUserLoaded")
      p Loading...
    template(v-else)
      notifications-display
      app-menu
      .container-fluid
        app-header
        div(:class='{sticky: user.preferences.stickyHeader}')
          router-view
        app-footer
</template>

<script>
import axios from 'axios';
import AppMenu from './components/appMenu';
import AppHeader from './components/appHeader';
import AppFooter from './components/appFooter';
import notificationsDisplay from './components/notifications';
import { mapState } from 'client/libs/store';

export default {
  name: 'app',
  components: {
    AppMenu,
    AppHeader,
    AppFooter,
    notificationsDisplay,
  },
  data () {
    return {
      isUserLoaded: false,
    };
  },
  computed: {
    ...mapState(['isUserLoggedIn']),
    ...mapState({user: 'user.data'}),
    isStaticPage () {
      return this.$route.meta.requiresLogin === false ? true : false;
    },
  },
  created () {
    // Set up Error interceptors
    axios.interceptors.response.use((response) => {
      if (this.user) {
        this.$set(this.user, 'notifications', response.data.notifications);
      }
      return response;
    }, (error) => {
      if (error.response.status >= 400) {
        this.$notify({
          title: 'Habitica',
          text: error.response.data.message,
        });
      }

      return Promise.reject(error);
    });

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

<style src="intro.js/minified/introjs.min.css"></style>
<style src="bootstrap/scss/bootstrap.scss" lang="scss"></style>
<style src="assets/scss/index.scss" lang="scss"></style>
<style src="assets/css/index.css"></style>
