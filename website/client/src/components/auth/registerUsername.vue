<template>
  <div class="gradient-bg">
    <div
      id="privacy-tos"
      class="w-100"
    >
      <privacy-banner
        class="privacy-banner"
      />
      <div class="d-flex flex-column mx-auto pt-5 w-448px">
        <img
          class="mx-auto"
          src="@/assets/images/home/signup-quill@2x.png"
          width="120px"
        >
        <h1 class="mt-0 mb-3 white mx-auto">
          {{ $t('whatToCallYou') }}
        </h1>
        <form
          class="form mx-auto"
          @submit.prevent.stop="register()"
        >
          <input
            id="usernameInput"
            v-model="username"
            class="form-control dark"
            type="text"
            :placeholder="$t('username')"
            :class="{
              'mb-3': !usernameInvalid,
              'input-valid': username && usernameValid,
              'input-invalid mb-2': usernameInvalid,
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
          <p class="purple-600">
            {{ $t('usernameLimitations') }}
          </p>
          <div class="custom-control custom-checkbox mb-4">
            <input
              id="privacyTOS"
              v-model="privacyAccepted"
              class="custom-control-input dark"
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
            class="btn btn-info d-block w-100 sign-up mx-auto mb-5"
            :disabled="!username || usernameInvalid || !privacyAccepted"
            type="submit"
          >
            {{ $t('getStarted') }}
          </button>
        </form>
      </div>
    </div>
  </div>
</template>

<style lang="scss">
  @import '@/assets/scss/colors.scss';

  #privacy-tos {
    position: relative;
    z-index: 2;
    width: 448px;
    background-image: url('@/assets/images/auth/seamless_stars_varied_opacity.png');
    background-repeat: repeat-x;

    a {
      color: $white;
      font-weight: bold;
      text-decoration: underline;
    }

    .privacy-banner a {
      color: $purple-300;
      font-weight: normal;
      text-decoration: none;

      &:hover {
        text-decoration: underline;
      }
    }
  }
</style>

<style lang="scss" scoped>
  @import '@/assets/scss/colors.scss';
  @import '@/assets/scss/privacy.scss';
  @import '@/assets/scss/forms.scss';

  p.purple-600 {
    line-height: 1.714;
  }

  .custom-checkbox {
    .custom-control-label::before {
      border-radius: 2px;
      margin-top: 2px;
    }

    .custom-control-input:checked~.custom-control-label::after {
      margin-top: 2px;
    }
  }

  .gradient-bg {
    background: linear-gradient(to bottom, $purple-200, $purple-300);
    height: 700px;
  }

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

  .w-448px {
    width: 448px;
  }
</style>

<script>
import debounce from 'lodash/debounce';
import PrivacyBanner from '@/components/header/banners/privacy';
import sanitizeRedirect from '@/mixins/sanitizeRedirect';

export default {
  components: {
    PrivacyBanner,
  },
  mixins: [sanitizeRedirect],
  data () {
    return {
      authData: {},
      email: '',
      password: '',
      passwordConfirm: '',
      privacyAccepted: false,
      registrationMethod: null,
      username: '',
      usernameIssues: [],
    };
  },
  computed: {
    usernameValid () {
      if (this.username?.length < 1) return false;
      return this.usernameIssues.length === 0;
    },
    usernameInvalid () {
      if (this.username?.length < 1) return false;
      return !this.usernameValid;
    },
  },
  watch: {
    username () {
      this.validateUsername(this.username || '');
    },
  },
  mounted () {
    if (window.sessionStorage.getItem('apple-token')) {
      this.registrationMethod = 'apple';
    } else if (!this.$store.state.registrationOptions.registrationMethod) {
      this.$router.push('/');
    } else {
      this.registrationMethod = this.$store.state.registrationOptions.registrationMethod;
    }
    this.authData = this.$store.state.registrationOptions.authData;
    this.email = this.$store.state.registrationOptions.email;
    this.username = this.$store.state.registrationOptions.username;
    this.password = this.$store.state.registrationOptions.password;
    this.passwordConfirm = this.$store.state.registrationOptions.passwordConfirm;

    if (!this.email) {
      return;
    }
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
      } else if (this.registrationMethod === 'apple') {
        await this.$store.dispatch('auth:appleAuth', {
          idToken: window.sessionStorage.getItem('apple-token'),
          name: window.sessionStorage.getItem('apple-name'),
          username: this.username,
          allowRegister: true,
        });
      } else {
        await this.$store.dispatch('auth:socialAuth', {
          auth: this.authData,
          username: this.username,
        });
      }
      window.location.href = '/';
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
