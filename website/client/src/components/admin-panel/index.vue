<template>
  <div
    v-if="user.contributor.admin"
    class="row standard-page"
  >
    <div class="well">
      <h1>Admin Panel</h1>

      <div class="row">
        <form
          class="form-inline"
          @submit.prevent="loadHero(userIdentifier)"
        >
          <input
            v-model="userIdentifier"
            class="form-control"
            type="text"
            :placeholder="'User ID or Username; blank for your account'"
            :style="{ 'min-width': '45ch' }"
          >
          <input
            type="submit"
            value="Load User (click or hit enter)"
            class="btn btn-secondary"
          >
        </form>
      </div>

      <div class="row">
        <router-view @changeUserIdentifier="changeUserIdentifier" />
      </div>
    </div>
  </div>
</template>

<script>
import VueRouter from 'vue-router';
import { mapState } from '@/libs/store';

const { isNavigationFailure, NavigationFailureType } = VueRouter;

export default {
  components: {
  },
  data () {
    return {
      userIdentifier: '',
    };
  },
  computed: {
    ...mapState({ user: 'user.data' }),
  },
  methods: {
    changeUserIdentifier (newId) {
      // If we've accessed the admin panel from a URL that had a user identifier in it,
      // this method will insert that identifier into the "Load User" form field
      // (useful if we want to re-fetch the user after making changes).
      this.userIdentifier = newId;
    },
    async loadHero (userIdentifier) {
      const id = userIdentifier || this.user._id;

      this.$router.push({
        name: 'adminPanelUser',
        params: { userIdentifier: id },
      }).catch(failure => {
        if (isNavigationFailure(failure, NavigationFailureType.duplicated)) {
          // the admin has requested that the same user be displayed again so reload the page
          // (e.g., if they changed their mind about changes they were making)
          this.$router.go();
        }
      });
    },
  },
};
</script>
