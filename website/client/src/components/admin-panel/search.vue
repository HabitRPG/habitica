<template>
  <div>
    <div
      v-if="noUsersFound"
      class="alert alert-warning"
      role="alert"
    >
      Could not find any matching users.
    </div>
    <loading-spinner class="mx-auto mb-2" dark-color="true" v-if="isSearching" />
    <div
      v-if="users.length > 0"
      class="list-group"
    >
      <a
        v-for="user in users"
        :key="user._id"
        href="#"
        class="list-group-item list-group-item-action"
        @click="loadUser(user._id)"
      >
        <div class="d-flex w-100 justify-content-between">
          <h5 class="mb-1">{{ user.profile.name }}</h5>
          <small>{{ user._id }}</small>
        </div>
        <p
          class="mb-1"
          :class="{'highlighted-value': matchValueToIdentifier(user.auth.local.username)}"
        >
          @{{ user.auth.local.username }}</p>
        <p class="mb-0">
          <span
            v-for="email in userEmails(user)"
            :key="email"
            :class="{'highlighted-value': matchValueToIdentifier(email)}"
          >
            {{ email }}
          </span>
        </p>
      </a>
    </div>
  </div>
</template>

<style lang="scss" scoped>
  .highlighted-value {
    font-weight: bold;
  }
</style>

<script>
import VueRouter from 'vue-router';
import { mapState } from '@/libs/store';
import LoadingSpinner from '../ui/loadingSpinner';

const { isNavigationFailure, NavigationFailureType } = VueRouter;

export default {
  components: {
    LoadingSpinner,
  },
  data () {
    return {
      userIdentifier: '',
      users: [],
      noUsersFound: false,
      isSearching: false,
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
      this.isSearching = true;
      this.$store.dispatch('adminPanel:searchUsers', { userIdentifier: this.userIdentifier }).then(users => {
        this.isSearching = false;
        if (users.length === 1) {
          this.loadUser(users[0]._id);
        } else {
          const matchIndex = users.findIndex(user => this.isExactMatch(user));
          if (matchIndex !== -1) {
            users.splice(0, 0, users.splice(matchIndex, 1)[0]);
          }
          this.users = users;
          this.noUsersFound = users.length === 0;
        }
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
      const allEmails = [];
      if (user.auth.local.email) allEmails.push(user.auth.local.email);
      if (user.auth.google && user.auth.google.emails) {
        const emails = user.auth.google.emails;
        allEmails.push(...this.findSocialEmails(emails));
      }
      if (user.auth.apple && user.auth.apple.emails) {
        const emails = user.auth.apple.emails;
        allEmails.push(...this.findSocialEmails(emails));
      }
      if (user.auth.facebook && user.auth.facebook.emails) {
        const emails = user.auth.facebook.emails;
        allEmails.push(...this.findSocialEmails(emails));
      }
      return allEmails;
    },
    findSocialEmails (emails) {
      if (typeof emails === 'string') return [emails];
      if (Array.isArray(emails)) return emails.map(email => email.value);
      if (typeof emails === 'object') return [emails.value];
      return [];
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
    isExactMatch (user) {
      return user._id === this.userIdentifier
        || user.auth.local.username === this.userIdentifier
        || (user.auth.google && user.auth.google.emails && user.auth.google.emails.findIndex(
          email => email.value === this.userIdentifier,
        ) !== -1)
        || (user.auth.apple && user.auth.apple.emails && user.auth.apple.emails.findIndex(
          email => email.value === this.userIdentifier,
        ) !== -1)
        || (user.auth.facebook && user.auth.facebook.emails && user.auth.facebook.emails.findIndex(
          email => email.value === this.userIdentifier,
        ) !== -1);
    },
  },
};
</script>
