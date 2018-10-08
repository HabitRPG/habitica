import debounce from 'lodash/debounce';

export default {
  watch: {
  },
  methods: {
    validateUsername: debounce(function validateUsernameDebounce (username) {
      if (username.length <= 3) {
        return;
      }
      this.$store.dispatch('auth:verifyUsername', {
        username: this.username,
      }).then(res => {
        if (res.issues !== undefined) {
          this.usernameIssues = res.issues;
        } else {
          this.usernameIssues = [];
        }
      });
    }, 500),
    validateUsername: debounce(function validateUsernameDebounce (username) {
      if (username.length <= 3 || !this.registering) {
        return;
      }
      this.$store.dispatch('auth:verifyUsername', {
        username: this.username,
      }).then(res => {
        if (res.issues !== undefined) {
          this.usernameIssues = res.issues;
        } else {
          this.usernameIssues = [];
        }
      });
    }, 500),
    validateUsername: debounce(function validateUsernameDebounce (username) {
      if (username.length <= 1 || username === this.user.auth.local.username) {
        this.usernameIssues = [];
        return;
      }
      this.$store.dispatch('auth:verifyUsername', {
        username,
      }).then(res => {
        if (res.issues !== undefined) {
          this.usernameIssues = res.issues;
        } else {
          this.usernameIssues = [];
        }
      });
    }, 500),
  },
  computed: {
    usernameValid () {
      if (this.username.length <= 3) return false; // from the others
      return this.usernameIssues.length === 0;
    },
    usernameValid () {
      if (this.usernameUpdates.username.length <= 1) return false; // from site.vue
      return this.usernameIssues.length === 0;
    },
    usernameInvalid () {
      if (this.username.length <= 3) return false;
      return !this.usernameValid;
    },
    usernameInvalid () {
      if (this.usernameUpdates.username.length <= 1) return false;
      return !this.usernameValid;
    },
    usernameInvalid () {
      return !this.usernameValid;
    },

    emailValid () {
      if (this.email.length <= 3) return false;
      return this.validateEmail(this.email);
    },
    emailInvalid () {
      return !this.emailValid;
    },
    emailInvalid () {
      if (this.email.length <= 3) return false;
      return !this.emailValid;
    },

    passwordConfirmValid () {
      if (this.passwordConfirm.length <= 3) return false;
      return this.passwordConfirm === this.password;
    },
    passwordConfirmInvalid () {
      if (this.passwordConfirm.length <= 3) return false;
      return !this.passwordConfirmValid;
    },
    passwordConfirmInvalid () {
      return !this.passwordConfirmValid;
    },
    passwordConfirmInvalid () {
      if (this.passwordConfirm.length <= 3) return false;
      return this.passwordConfirm !== this.password;
    },
    verifiedUsername () {
      return this.user.flags.verifiedUsername;
    },
  },
};
