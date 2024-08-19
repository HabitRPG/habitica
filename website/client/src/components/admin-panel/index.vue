<template>
  <div class="row standard-page col-12 d-flex justify-content-center">
    <div class="admin-panel-content">
      <h1>Admin Panel</h1>
      <form
        class="form-inline"
        @submit.prevent="searchUsers(userIdentifier)"
      >
        <div class="input-group col pl-0 pr-0">
          <input
            v-model="userIdentifier"
            class="form-control"
            type="text"
            :placeholder="'UserID, username, email, or leave blank for your account'"
          >
          <div class="input-group-append">
            <button
              class="btn btn-primary"
              type="button"
              @click="loadUser(userIdentifier)"
            >
              Load User
            </button>
            <button
              class="btn btn-secondary"
              type="button"
              @click="searchUsers(userIdentifier)"
            >
              Search
            </button>
          </div>
        </div>
      </form>

      <router-view
        class="mt-3"
        @changeUserIdentifier="changeUserIdentifier"
      />
    </div>
  </div>
</template>

<style lang="scss" scoped>
  .uidField {
    min-width: 45ch;
  }

  .input-group-append {
    width:auto;
  }

  .admin-panel-content {
    flex: 0 0 800px;
    max-width: 800px;
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
    async searchUsers (userIdentifier) {
      if (!userIdentifier || userIdentifier === '') {
        this.loadUser();
        return;
      }
      this.$router.push({
        name: 'adminPanelSearch',
        params: { userIdentifier },
      }).catch(failure => {
        if (isNavigationFailure(failure, NavigationFailureType.duplicated)) {
          // the admin has requested that the same user be displayed again so reload the page
          // (e.g., if they changed their mind about changes they were making)
          this.$router.go();
        }
      });
    },

    async loadUser (userIdentifier) {
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
