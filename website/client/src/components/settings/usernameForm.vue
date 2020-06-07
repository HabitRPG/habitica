<template>
  <div>
    <div class="form-group">
      <div class="d-flex align-items-center">
        <label
          class="mr-3"
          for="displayName"
        >{{ $t('displayName') }}</label>
        <div class="flex-grow-1">
          <input
            id="displayName"
            v-model="temporaryDisplayName"
            class="form-control"
            type="text"
            :placeholder="$t('newDisplayName')"
            :class="{
              'is-invalid input-invalid': displayNameInvalid,
              'input-valid': displayNameValid, 'text-darker': temporaryDisplayName.length > 0}"
            @blur="restoreEmptyDisplayName()"
          >
        </div>
      </div>
    </div>
    <div
      v-if="displayNameIssues.length > 0"
      class="mb-3"
    >
      <div
        v-for="issue in displayNameIssues"
        :key="issue"
        class="input-error text-center"
      >
        {{ issue }}
      </div>
    </div>
    <div class="form-group">
      <div class="d-flex align-items-center">
        <label
          class="mr-3"
          for="username"
        >{{ $t('username') }}</label>
        <div class="flex-grow-1">
          <div class="input-group-prepend input-group-text">
            @
            <input
              id="username"
              v-model="temporaryUsername"
              class="form-control"
              type="text"
              :placeholder="$t('newUsername')"
              :class="{
                'is-invalid input-invalid': usernameInvalid,
                'input-valid': usernameValid, 'text-darker': temporaryUsername.length > 0}"
              @blur="restoreEmptyUsername()"
            >
          </div>
        </div>
      </div>
    </div>
    <div
      v-if="usernameIssues.length > 0"
      class="mb-3"
    >
      <div
        v-for="issue in usernameIssues"
        :key="issue"
        class="input-error text-center"
      >
        {{ issue }}
      </div>
    </div>
    <div
      v-if="!avatarIntro"
      class="small text-center mb-3"
    >
      {{ $t('usernameLimitations') }}
    </div>
    <div class="row justify-content-center">
      <button
        class="btn btn-primary"
        type="submit"
        :class="{disabled: usernameCannotSubmit}"
        :disabled="usernameCannotSubmit"
        @click="submitNames()"
      >
        {{ $t(avatarIntro ? 'getStarted' : 'saveAndConfirm') }}
      </button>
    </div>
  </div>
</template>

<style lang="scss" scoped>
  @import '~@/assets/scss/colors.scss';

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

  input.form-control:not(:focus):not(:active) {
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
import { mapState } from '@/libs/store';
import { EVENTS } from '@/libs/events';

export default {
  props: {
    avatarIntro: {
      type: Boolean,
      default: false,
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
  mounted () {
    this.temporaryDisplayName = this.user.profile.name;
    this.temporaryUsername = this.user.auth.local.username;
  },
  methods: {
    async close () {
      this.$root.$emit(EVENTS.RESYNC_REQUESTED);
      await this.$store.dispatch('user:fetch', { forceLoad: true });
      this.$root.$emit(EVENTS.RESYNC_COMPLETED);
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
        await axios.put('/api/v4/user/', { 'profile.name': this.temporaryDisplayName });
      }
      await axios.put('/api/v4/user/auth/update-username', { username: this.temporaryUsername });
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
};
</script>
