<template lang="pug">
  div
    .form-group
      .d-flex.align-items-center
        label.mr-3(for='displayName') {{ $t('displayName') }}
        .flex-grow-1
          input#displayName.form-control(
            type='text',
            :placeholder="$t('newDisplayName')",
            v-model='temporaryDisplayName',
            @blur='restoreEmptyDisplayName()',
            :class='{"is-invalid input-invalid": displayNameInvalid, "input-valid": displayNameValid, "text-darker": temporaryDisplayName.length > 0}')
    .mb-3(v-if="displayNameIssues.length > 0")
      .input-error.text-center(v-for="issue in displayNameIssues") {{ issue }}
    .form-group
      .d-flex.align-items-center
        label.mr-3(for='username') {{ $t('username') }}
        .flex-grow-1
          .input-group-prepend.input-group-text @
            input#username.form-control(
              type='text',
              :placeholder="$t('newUsername')",
              v-model='temporaryUsername',
              @blur='restoreEmptyUsername()',
              :class='{"is-invalid input-invalid": usernameInvalid, "input-valid": usernameValid, "text-darker": temporaryUsername.length > 0}')
    .mb-3(v-if="usernameIssues.length > 0")
      .input-error.text-center(v-for="issue in usernameIssues") {{ issue }}
    .small.text-center.mb-3(v-if='!avatarIntro') {{ $t('usernameLimitations') }}
    .row.justify-content-center
      button.btn.btn-primary(type='submit', @click='submitNames()', :class='{disabled: usernameCannotSubmit}', :disabled='usernameCannotSubmit') {{ $t(avatarIntro ? 'getStarted' : 'saveAndConfirm') }}
</template>

<style lang="scss" scoped>
  @import '~client/assets/scss/colors.scss';

  button {
    margin: 0.25rem auto 1rem;
  }

  .col-3 {
    padding-right: 0rem;
  }

  .form-control {
    height: 2.25rem;
  }

  .form-group {
    background-color: $gray-700;
    border-radius: 2px;
    border: solid 1px $gray-500;
  }

  input {
    border: 0px;
  }

  .input-error {
    color: $red-50;
    font-size: 90%;
    width: 100%;
  }

  .input-group-prepend {
    margin-right: 0px;
  }

  .input-group-text {
    background-color: $white;
    border: 0px;
    border-radius: 0px;
    color: $gray-300;
    padding: 0rem 0.1rem 0rem 0.75rem;
  }

  label {
    color: $gray-100;
    font-weight: bold;
    margin-bottom: 0rem;
    margin-left: 1rem;
    min-width: 90px;
  }

  .small {
    color: $gray-200;
  }

  .text-darker {
    color: $gray-50;
  }

  #username {
    padding-left: 0.25rem;
  }
</style>

<script>
  import axios from 'axios';
  import debounce from 'lodash/debounce';
  import { mapState } from 'client/libs/store';

  export default {
    computed: {
      ...mapState({
        user: 'user.data',
      }),
      displayNameInvalid () {
        if (this.temporaryDisplayName.length < 1) return false;
        return !this.displayNameValid;
      },
      displayNameValid () {
        if (this.temporaryDisplayName.length < 1) return false;
        return this.displayNameIssues.length === 0;
      },
      usernameCannotSubmit () {
        if (this.temporaryUsername.length < 1) return true;
        return !this.usernameValid || !this.displayNameValid;
      },
      usernameInvalid () {
        if (this.temporaryUsername.length < 1) return false;
        return !this.usernameValid;
      },
      usernameValid () {
        if (this.temporaryUsername.length < 1) return false;
        return this.usernameIssues.length === 0;
      },
    },
    data () {
      return {
        displayNameIssues: [],
        temporaryDisplayName: '',
        temporaryUsername: '',
        usernameIssues: [],
      };
    },
    methods: {
      async close () {
        this.$root.$emit('habitica::resync-requested');
        await this.$store.dispatch('user:fetch', {forceLoad: true});
        this.$root.$emit('habitica::resync-completed');
        if (this.avatarIntro) {
          this.$emit('usernameConfirmed');
        } else {
          this.$root.$emit('bv::hide::modal', 'verify-username');
          this.$router.go(0);
        }
      },
      restoreEmptyDisplayName () {
        if (this.temporaryDisplayName.length < 1) {
          this.temporaryDisplayName = this.user.profile.name;
        }
      },
      restoreEmptyUsername () {
        if (this.temporaryUsername.length < 1) {
          this.temporaryUsername = this.user.auth.local.username;
        }
      },
      async submitNames () {
        if (this.temporaryDisplayName !== this.user.profile.name) {
          await axios.put('/api/v4/user/', {'profile.name': this.temporaryDisplayName});
        }
        await axios.put('/api/v4/user/auth/update-username', {username: this.temporaryUsername});
        this.close();
      },
      validateDisplayName: debounce(function checkName (displayName) {
        if (displayName.length <= 1 || displayName === this.user.profile.name) {
          this.displayNameIssues = [];
          return;
        }
        this.$store.dispatch('auth:verifyDisplayName', {
          displayName,
        }).then(res => {
          if (res.issues !== undefined) {
            this.displayNameIssues = res.issues;
          } else {
            this.displayNameIssues = [];
          }
        });
      }, 500),
      validateUsername: debounce(function checkName (username) {
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
    mounted () {
      this.temporaryDisplayName = this.user.profile.name;
      this.temporaryUsername = this.user.auth.local.username;
    },
    props: {
      avatarIntro: {
        type: Boolean,
        default: false,
      },
    },
    watch: {
      temporaryDisplayName: {
        handler () {
          this.validateDisplayName(this.temporaryDisplayName);
        },
        deep: true,
      },
      temporaryUsername: {
        handler () {
          this.validateUsername(this.temporaryUsername);
        },
        deep: true,
      },
    },
  };
</script>
