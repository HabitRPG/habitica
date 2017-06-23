<!-- Entry point component for the entire app -->

<template lang="pug">
#app
  app-menu(v-if="userLoggIn")
  .container-fluid(v-if="userLoggIn")
    app-header
    router-view

  router-view(v-if="!userLoggIn")
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
  data () {
    return {
      userLoggIn: false,
    };
  },
  async beforeCreate () {
    // Setup listener for title
    this.$store.watch(state => state.title, (title) => {
      document.title = title;
    });

    // Mount the app when user and tasks are loaded
    const userDataWatcher = this.$store.watch(state => [state.user.data, state.tasks.data], ([user, tasks]) => {
      if (user && user._id && Array.isArray(tasks)) {
        userDataWatcher(); // remove the watcher
        // this.$mount('#app');
      }
    });

    // @TODO: Move this to store?
    let authSettings = localStorage.getItem('habit-mobile-settings');
    if (!authSettings) return;

    // Load the user and the user tasks
    await Promise.all([
      this.$store.dispatch('user:fetch'),
      this.$store.dispatch('tasks:fetchUserTasks'),
    ]).catch((err) => {
      console.error('Impossible to fetch user. Copy into localStorage a valid habit-mobile-settings object.', err); // eslint-disable-line no-console
    });
  },
  mounted () { // Remove the loading screen when the app is mounted
    let loadingScreen = document.getElementById('loading-screen');
    if (loadingScreen) document.body.removeChild(loadingScreen);
  },
};
</script>

<style src="bootstrap/scss/bootstrap.scss" lang="scss"></style>
<style src="assets/scss/index.scss" lang="scss"></style>
<style src="assets/css/index.css"></style>
