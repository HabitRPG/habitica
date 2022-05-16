<template>
  <div class="row standard-page">
    <div class="well col-12">
      <h1>Admin Panel</h1>

      <div>
        <form
          class="form-inline"
          @submit.prevent="loadHero(userIdentifier)"
        >
          <input
            v-model="userIdentifier"
            class="form-control uidField"
            type="text"
            :placeholder="'User ID or Username; blank for your account'"
          >
          <input
            type="submit"
            value="Load User"
            class="btn btn-secondary"
          >
        </form>
      </div>

      <div>
        <router-view @changeUserIdentifier="changeUserIdentifier" />
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
  .uidField {
    min-width: 45ch;
  }
</style>

<script>
import VueRouter from 'vue-router';
import { mapState } from '@/libs/store';

const { isNavigationFailure, NavigationFailureType } = VueRouter;

export default {
  data () {
    return {
      userIdentifier: '',
    };
  },
  computed: {
    ...mapState({ user: 'user.data' }),
  },
  mounted () {
    this.$store.dispatch('common:setTitle', {
      section: 'Admin Panel',
    });
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
