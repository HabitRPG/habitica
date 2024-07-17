<template>
  <div>
    <div class="alert alert-warning" role="alert"
      v-if="noUsersFound"
    >
      Could not find any matching users.
    </div>
    <div class="list-group col-4"
      v-if="users.length > 0">
      <a href="#" class="list-group-item list-group-item-action"
        v-for="user in users"
        :key="user._id"
        @click="loadUser(user._id)"
      >
        <div class="d-flex w-100 justify-content-between">
          <h5 class="mb-1">{{ user.profile.name }}</h5>
          <small>{{ user._id }}</small>
        </div>
        <p class="mb-1"
        :class="{'font-weight-bold': matchValueToIdentifier(user.auth.local.username)}">
          @{{ user.auth.local.username }}</p>
          <p class="mb-0">
            <span
              v-for="email in userEmails(user)"
              :class="{'font-weigh-bold': matchValueToIdentifier(email)}"
              :key="email">
              {{ email }}
            </span>
          </p>
      </a>
    </div>
  </div>
</template>

<script>
import VueRouter from 'vue-router';
import { mapState } from '@/libs/store';

const { isNavigationFailure, NavigationFailureType } = VueRouter;

export default {
  data () {
    return {
      userIdentifier: '',
      users: [],
      noUsersFound: false,
    };
  },
  computed: {
    ...mapState({ user: 'user.data' }),
  },
  beforeRouteUpdate (to, from, next) {
    this.userIdentifier = to.params.userIdentifier;
    next();
  },
  watch: {
    userIdentifier () {
      this.$store.dispatch('adminPanel:searchUsers', { userIdentifier: this.userIdentifier }).then(users => {
        this.users = users;
        this.noUsersFound = users.length === 0;
      });
      this.$emit('changeUserIdentifier', this.userIdentifier); // change user identifier in Admin Panel's form
    },
  },
  mounted () {
    this.userIdentifier = this.$route.params.userIdentifier;
  },
  methods: {
    matchValueToIdentifier (value) {
      return value.toLowerCase().includes(this.userIdentifier.toLowerCase());
    },
    userEmails (user) {
      const emails = [];
      if (user.auth.local.email) emails.push(user.auth.local.email);
      if (user.auth.google && user.auth.google.email) {
        const email = user.auth.google.email;
        if (typeof email === 'string') emails.push(email);
        else if (Array.isArray(email)) emails.push(...email);
      }
      if (user.auth.apple && user.auth.apple.email) {
        const email = user.auth.apple.email;
        if (typeof email === 'string') emails.push(email);
        else if (Array.isArray(email)) emails.push(...email);
      }
      if (user.auth.facebook && user.auth.facebook.email) {
        const email = user.auth.facebook.email;
        if (typeof email === 'string') emails.push(email);
        else if (Array.isArray(email)) emails.push(...email);
      }
      return emails;
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
