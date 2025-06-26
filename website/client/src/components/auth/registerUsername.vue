<template>
  <div
    id="privacy-tos"
    class="w-25 mx-auto text-center"
  >
    <img
      src="@/assets/images/home/signup-quill@2x.png"
      width="120px"
    >
    <h1 class="mt-0 mb-4 white">{{ $t('whatToCallYou') }}</h1>
    <form
      class="form"
      @submit.prevent.stop="register()"
    >
      <input
        id="usernameInput"
        v-model="username"
        class="form-control mb-3"
        type="text"
        :placeholder="$t('username')"
        :class="{
          'mb-2': usernameInvalid,
        }"
      >
      <!-- eslint-disable vue/require-v-for-key -->
      <div
        v-for="issue in usernameIssues"
        class="input-error"
      >
        <!-- eslint-enable vue/require-v-for-key -->
        {{ issue }}
      </div>
      <p class="white">{{ $t('usernameLimitations')}} </p>
      <div class="custom-control custom-checkbox">
        <input
          id="privacyTOS"
          v-model="privacyAccepted"
          class="custom-control-input"
          type="checkbox"
        >
        <label
          v-once
          class="custom-control-label purple-600"
          for="privacyTOS"
          v-html="$t('acceptPrivacyTOS')"
        ></label>
      </div>
      <button
        class="btn btn-info sign-up mb-5"
        :disabled="!username || usernameInvalid || !privacyAccepted"
        type="submit"
      >
        {{ $t('getStarted') }}
      </button>
    </form>
  </div>
</template>

<style lang="scss">
  @import '@/assets/scss/colors.scss';

  #privacy-tos {
    a {
      color: $white;
      font-weight: bold;
      text-decoration: underline;
    }
  }
</style>

<style lang="scss" scoped>
  @import '@/assets/scss/colors.scss';

  .input-error {
    font-size: 90%;
    width: 100%;
    margin-bottom: 1em;
  }

  .sign-up {
    border: 2px solid transparent;
    box-shadow: 0 1px 3px 0 rgba($black, 0.16), 0 1px 3px 0 rgba($black, 0.24);

    &:focus, &:active {
      background-color: $blue-50;
      border: 2px solid $purple-400;
      box-shadow: 0 3px 6px 0 rgba($black, 0.16), 0 3px 6px 0 rgba($black, 0.24);
    }
  }
</style>

<script>
import debounce from 'lodash/debounce';
import { buildAppleAuthUrl } from '../../libs/auth';
import sanitizeRedirect from '@/mixins/sanitizeRedirect';

export default {
  mixins: [sanitizeRedirect],
  props: {
    email: String,
    password: String,
    passwordConfirm: String,
    registrationMethod: String,
  },
  data () {
    return {
      privacyAccepted: false,
      username: '',
      usernameIssues: [],
    };
  },
  computed: {
    usernameValid () {
      if (this.username.length < 1) return false;
      return this.usernameIssues.length === 0;
    },
    usernameInvalid () {
      if (this.username.length < 1) return false;
      return !this.usernameValid;
    },
  },
  watch: {
    username () {
      this.validateUsername(this.username);
    },
  },
  mounted () {
    const usernameToCheck = this.email.split('@')[0].replace(/[^a-zA-Z0-9\-_]/g, '');
    this.$store.dispatch('auth:verifyUsername', {
      username: usernameToCheck,
    }).then(res => {
      if (!res.issues) {
        this.username = usernameToCheck;
      }
    });
    document.getElementById('usernameInput').focus();
  },
  methods: {
    async register () {
      if (this.registrationMethod === 'local') {
        let groupInvite = '';
        if (this.$route.query && this.$route.query.p) {
          groupInvite = this.$route.query.p;
        }
  
        if (this.$route.query && this.$route.query.groupInvite) {
          groupInvite = this.$route.query.groupInvite;
        }
  
        await this.$store.dispatch('auth:register', {
          username: this.username,
          email: this.email,
          password: this.password,
          passwordConfirm: this.passwordConfirm,
          groupInvite,
        });
  
        const redirect = this.sanitizeRedirect(this.$route.query.redirectTo);
  
        window.location.href = redirect;
      } else {
        socialAuth(this.registrationMethod);
      }
    },
    // @TODO: Abstract hello in to action or lib
    async socialAuth (network) {
      if (network === 'apple') {
        window.location.href = buildAppleAuthUrl();
      } else {
        try {
          await hello(network).logout();
        } catch (e) {} // eslint-disable-line

        const redirectUrl = `${window.location.protocol}//${window.location.host}`;
        const auth = await hello(network).login({
          scope: 'email',
          // explicitly pass the redirect url or it might redirect to /home
          redirect_uri: redirectUrl, // eslint-disable-line camelcase
        });

        await this.$store.dispatch('auth:socialAuth', {
          auth,
        });

        window.location.href = '/';
      }
    },
    // eslint-disable-next-line func-names
    validateUsername: debounce(function (username) {
      if (username.length < 1) {
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
  },
};
</script>