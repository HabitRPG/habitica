<template lang="pug">
  b-modal#verify-username(
    size="m",
    :no-close-on-backdrop="true",
    :no-close-on-esc="true",
    :hide-header="true",
    :hide-footer="true",
    @hide="$emit('hide')",
  ).d-flex
    div.nametag-header(v-html='icons.helloNametag')
    h2.text-center {{ $t('usernameTime') }}
    p.text-center(v-html="$t('usernameInfo')")
    .form-group
      .row.align-items-center
        .col-3
          label(for='displayName') {{ $t('displayName') }}
        .col-9
          input#displayName.form-control(
            type='text',
            :placeholder="$t('newDisplayName')",
            v-model='temporaryDisplayName',
            @blur='restoreEmptyDisplayName()',
            :class='{"is-invalid input-invalid": displayNameInvalid, "input-valid": displayNameValid}')
    .mb-3(v-if="displayNameIssues.length > 0")
      .input-error.text-center(v-for="issue in displayNameIssues") {{ issue }}
    .form-group
      .row.align-items-center
        .col-3
          label(for='username') {{ $t('username') }}
        .col-9
          input#username.form-control(
            type='text',
            :placeholder="$t('newUsername')",
            v-model='temporaryUsername',
            @blur='restoreEmptyUsername()',
            :class='{"is-invalid input-invalid": usernameInvalid, "input-valid": usernameValid}')
    .mb-3(v-if="usernameIssues.length > 0")
      .input-error.text-center(v-for="issue in usernameIssues") {{ issue }}
    .small.text-center {{ $t('usernameLimitations') }}
    .row.justify-content-center
      button.btn.btn-primary(type='submit', @click='submitNames()' :disabled='usernameCannotSubmit') {{ $t('saveAndConfirm') }}
    .small.text-center.tos-footer(v-html="$t('usernameTOSRequirements')")
</template>

<style lang="scss">
  #verify-username___BV_modal_outer_ .modal-content {
    width: 566px;
    padding-left: 2rem;
    padding-right: 2rem;
  }
</style>

<style lang="scss" scoped>
  @import '~client/assets/scss/colors.scss';

  button {
    margin: 2rem;
  }

  .col-3 {
    padding-right: 0rem;
  }

  .form-group {
    background-color: $gray-700;
    border-radius: 2px;
    border: solid 1px $gray-500;
  }

  h2 {
    color: $purple-200;
    margin-top: 1.5rem;
  }

  input {
    border: 0px;
  }

  .input-error {
    color: $red-50;
    font-size: 90%;
    width: 100%;
  }

  .input-error .input-error {
    margin-bottom: 1rem;
  }

  label {
    font-weight: bold;
    margin-bottom: 0rem;
    margin-left: 1rem;
  }

  .nametag-header {
    background-color: $gray-700;
    border-radius: 0.3rem 0.3rem 0rem 0rem;
    margin-left: -3rem;
    margin-right: -3rem;
    padding: 1rem 9rem 1rem 9rem;
  }

  p {
    color: #686274;
  }

  .small {
    color: $gray-200;
  }

  .tos-footer {
    background-color: $gray-700;
    border-radius: 0rem 0rem 0.3rem 0.3rem;
    margin-left: -3rem;
    margin-right: -3rem;
    padding: 1rem 4rem 1rem 4rem;
  }
</style>

<script>
  import axios from 'axios';
  import debounce from 'lodash/debounce';
  import helloNametag from 'assets/svg/hello-habitican.svg';
  import { mapState } from 'client/libs/store';

  export default {
    computed: {
      ...mapState({
        user: 'user.data',
      }),
      displayNameInvalid () {
        if (this.temporaryDisplayName.length <= 1) return false;
        return !this.displayNameValid;
      },
      displayNameValid () {
        if (this.temporaryDisplayName.length <= 1) return false;
        return this.displayNameIssues.length === 0;
      },
      usernameCannotSubmit () {
        if (this.temporaryUsername.length <= 1) return true;
        return !this.usernameValid;
      },
      usernameInvalid () {
        if (this.temporaryUsername.length <= 1) return false;
        return !this.usernameValid;
      },
      usernameValid () {
        if (this.temporaryUsername.length <= 1) return false;
        return this.usernameIssues.length === 0;
      },
    },
    data () {
      return {
        icons: Object.freeze({
          helloNametag,
        }),
        displayNameIssues: [],
        temporaryDisplayName: '',
        temporaryUsername: '',
        usernameIssues: [],
      };
    },
    methods: {
      async submitNames () {
        if (this.temporaryDisplayName !== this.user.profile.name) {
          await axios.put('/api/v4/user/', {'profile.name': this.temporaryDisplayName});
        }
        await axios.put('/api/v4/user/auth/update-username', {username: this.temporaryUsername});
        this.close();
      },
      async close () {
        this.$root.$emit('habitica::resync-requested');
        await this.$store.dispatch('user:fetch', {forceLoad: true});
        this.$root.$emit('habitica::resync-completed');
        this.$root.$emit('bv::hide::modal', 'verify-username');
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
