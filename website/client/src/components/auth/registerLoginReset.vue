<template>
  <div class="form-wrapper">
    <div id="top-background">
      <div class="seamless_stars_varied_opacity_repeat"></div>
    </div>
    <privacy-banner
      class="privacy-banner"
    />
    <form
      v-if="!forgotPassword && !resetPasswordSetNewOne"
      id="login-form"
      @submit.prevent.stop="handleSubmit"
    >
      <div class="text-center">
        <div>
          <a
            href="/static/home"
            class="svg-icon svg habitica-logo mx-auto mb-4"
            v-html="icons.habiticaIcon"
          ></a>
        </div>
      </div>
      <div class="form-group">
        <div>
          <div
            class="btn btn-secondary social-button"
            @click="proceed('google')"
          >
            <div
              class="svg-icon social-icon"
              v-html="icons.googleIcon"
            ></div>
            <div
              class="text"
            >
              {{ $t('signUpWithSocial', {social: 'Google'}) }}
            </div>
          </div>
        </div>
      </div>
      <div class="form-group">
        <div>
          <div
            class="btn btn-secondary social-button"
            @click="proceed('apple')"
          >
            <div
              class="svg-icon social-icon"
              v-html="icons.appleIcon"
            ></div>
            <div
              class="text"
            >
              {{ $t('signUpWithSocial', {social: 'Apple'}) }}
            </div>
          </div>
        </div>
      </div>
      <div class="strike mb-3">
        <span>{{ $t('or') }}</span>
      </div>
      <div
        v-if="!registering"
        class="form-group"
        :class="{ 'mb-2': usernameIssues.length > 0 }"
      >
        <label
          v-once
          for="usernameInput"
        >{{ $t('emailOrUsername') }}</label>
        <input
          id="usernameInput"
          v-model="username"
          class="form-control dark"
          type="text"
          :placeholder="$t('emailOrUsername')"
          :class="{
            'input-valid': usernameValid,
            'input-invalid': usernameInvalid,
          }"
        >
      </div>
      <div
        v-for="issue in usernameIssues"
        :key="issue"
        class="input-error"
      >
        {{ issue }}
      </div>
      <div
        v-if="registering"
        class="form-group"
      >
        <label
          v-once
          for="emailInput"
        >{{ $t('email') }}</label>
        <input
          id="emailInput"
          v-model="email"
          class="form-control dark"
          type="email"
          :placeholder="$t('emailPlaceholder')"
          :class="{
            'input-invalid input-with-error': emailError,
            'input-valid': emailValid,
          }"
        >
        <div
          v-if="emailError"
          class="input-error"
        >
          {{ emailError }}
        </div>
      </div>
      <div
        class="form-group"
        :class="{ 'mt-2': usernameIssues.length > 0 }"
      >
        <label
          v-once
          for="passwordInput"
        >{{ $t('password') }}</label>
        <a
          v-if="!registering"
          v-once
          class="float-right forgot-password"
          @click="forgotPassword = true"
        >{{ $t('forgotPassword') }}</a>
        <input
          id="passwordInput"
          v-model="password"
          class="form-control dark"
          type="password"
          :placeholder="$t(registering ? 'passwordPlaceholder' : 'password')"
          :class="{
            'input-invalid input-with-error': passwordInvalid,
            'input-valid': passwordValid
          }"
        >
        <div
          v-if="passwordInvalid && registering"
          class="input-error"
        >
          {{ $t('minPasswordLength') }}
        </div>
        <div
          v-if="passwordInvalid && !registering"
          class="input-error"
        >
          {{ $t('minPasswordLengthLogin') }}
        </div>
      </div>
      <div
        v-if="registering"
        class="form-group mb-4"
      >
        <label
          v-once
          for="confirmPasswordInput"
        >{{ $t('confirmPassword') }}</label>
        <input
          id="confirmPasswordInput"
          v-model="passwordConfirm"
          class="form-control dark input-with-error"
          type="password"
          :placeholder="$t('confirmPasswordPlaceholder')"
          :class="{'input-invalid': passwordConfirmInvalid, 'input-valid': passwordConfirmValid}"
        >
        <div
          v-if="passwordConfirmInvalid"
          class="input-error"
        >
          {{ $t('passwordConfirmationMatch') }}
        </div>
      </div>
      <div class="text-center">
        <button
          v-if="registering"
          id="continue-button"
          type="submit"
          class="btn btn-info w-100 mb-4"
          :disabled="!(emailValid && passwordValid && passwordConfirmValid)"
        >
          {{ $t('continue') }}
        </button>
        <button
          v-if="!registering"
          type="submit"
          class="btn btn-info w-100 mb-4"
          :disabled="!usernameValid || !passwordValid"
        >
          {{ $t('login') }}
        </button>
        <div>
          <router-link
            v-if="registering"
            :to="{name: 'login'}"
            exact="exact"
          >
            <a
              v-once
              class="white"
              v-html="$t('alreadyHaveAccountLogin')"
            ></a>
          </router-link>
          <router-link
            v-if="!registering"
            :to="{name: 'register'}"
            exact="exact"
          >
            <a
              v-once
              class="white"
              v-html="$t('dontHaveAccountSignup')"
            ></a>
          </router-link>
        </div>
      </div>
    </form>
    <form
      v-if="forgotPassword"
      id="forgot-form"
      @submit.prevent="handleSubmit"
    >
      <div>
        <div>
          <a
            href="/static/home"
            class="svg-icon habitica-logo mx-auto mb-4"
            v-html="icons.habiticaIcon"
          ></a>
        </div>
        <div class="header">
          <h2
            v-once
            class="text-center"
          >
            {{ $t('emailNewPass') }}
          </h2>
          <p
            v-once
            class="purple-600 text-left"
          >
            {{ $t('forgotPasswordSteps') }}
          </p>
        </div>
        <div
          class="form-group"
          :class="{
            'mb-2': usernameIssues.length > 0,
            'mb-4': usernameIssues.length === 0,
          }"
        >
          <label
            v-once
            for="usernameInput"
          >{{ $t('emailOrUsername') }}</label>
          <input
            id="usernameInput"
            v-model="username"
            class="form-control dark"
            type="text"
            :placeholder="$t('emailUsernamePlaceholder')"
            :class="{
              'input-valid': usernameValid,
              'input-invalid': usernameInvalid,
            }"
          >
        </div>
        <div
          v-for="issue in usernameIssues"
          :key="issue"
          class="input-error mb-2"
        >
          {{ issue }}
        </div>
        <div class="text-center">
          <button
            class="btn btn-info w-100"
            :disabled="!username || usernameIssues.length > 0"
            @click="forgotPasswordLink()"
          >
            {{ $t('sendLink') }}
          </button>
        </div>
      </div>
    </form>
    <form
      v-if="resetPasswordSetNewOne"
      id="reset-password-set-new-one-form"
      @submit.prevent="handleSubmit"
    >
      <div class="text-center">
        <div>
          <a
            href="/static/home"
            class="svg-icon habitica-logo mx-auto mb-4"
            v-html="icons.habiticaIcon"
          ></a>
        </div>
        <div class="header">
          <h2>{{ $t('passwordResetPage') }}</h2>
        </div>
      </div>
      <div class="form-group">
        <label
          v-once
          for="passwordInput"
        >{{ $t('newPass') }}</label>
        <input
          id="passwordInput"
          v-model="password"
          class="form-control input-with-error"
          type="password"
          :placeholder="$t('password')"
          :class="{'input-invalid': passwordInvalid, 'input-valid': passwordValid}"
        >
        <div
          v-if="passwordInvalid"
          class="input-error"
        >
          {{ $t('minPasswordLength') }}
        </div>
      </div>
      <div class="form-group">
        <label
          v-once
          for="confirmPasswordInput"
        >{{ $t('confirmPass') }}</label>
        <input
          id="confirmPasswordInput"
          v-model="passwordConfirm"
          class="form-control input-with-error"
          type="password"
          :placeholder="$t('confirmPasswordPlaceholder')"
          :class="{'input-invalid': passwordConfirmInvalid, 'input-valid': passwordConfirmValid}"
        >
        <div
          v-if="passwordConfirmInvalid"
          class="input-error"
        >
          {{ $t('passwordConfirmationMatch') }}
        </div>
      </div>
      <div class="text-center">
        <div
          class="btn btn-info"
          :enabled="!resetPasswordSetNewOneData.hasError"
          @click="resetPasswordSetNewOneLink()"
        >
          {{ $t('setNewPass') }}
        </div>
      </div>
    </form>
  </div>
</template>

<style>
  html, body, #app {
    min-height: 100%;
  }

  small a, small a:hover {
    color: #fff;
    text-decoration: underline;
  }
</style>

<style lang="scss" scoped>
  @import '@/assets/scss/colors.scss';
  @import '@/assets/scss/privacy.scss';

  @media only screen and (max-width: 768px) {
    .form-group {
      padding-left: .5em;
      padding-right: .5em;
    }
  }

  .form-wrapper {
    background-color: $purple-200;
    background: $purple-200; /* For browsers that do not support gradients */
    background: linear-gradient(to bottom, #4f2a93, #6133b4); /* Standard syntax */
  }

  ::-webkit-input-placeholder { /* Chrome/Opera/Safari */
    color: $purple-500;
  }
  ::-moz-placeholder { /* Firefox 19+ */
    color: $purple-500;
  }
  :-ms-input-placeholder { /* IE 10+ */
    color: $purple-500;
  }
  :-moz-placeholder { /* Firefox 18- */
    color: $purple-500;
  }
  ::placeholder { //  Standard browsers
    color: $purple-500;
  }

  #login-form, #forgot-form, #reset-password-set-new-one-form {
    margin: 0 auto;
    width: 448px;
    height: 700px;
    padding-top: 5em;
    padding-bottom: 4em;
    position: relative;
    z-index: 1;

    .header {
      h2 {
        font-size: 24px;
        color: $white;
      }

      p {
        line-height: 1.714;
      }
    }

    .habitica-logo {
      width: 145px;
    }

    label {
      color: $white;
      font-weight: bold;
      line-height: 1.714;
    }

    .input-with-error.input-invalid {
      margin-bottom: 0.5em;
    }

    #confirmPasswordInput + .input-error {
      margin-bottom: 2em;
    }

    .form-text {
      font-size: 14px;
      color: $white;
    }

    .social-button {
      width: 100%;
      height: 100%;
      white-space: inherit;
      text-align: center;

      .text {
        display: inline-block;
      }
    }

    .social-icon {
      margin-left: 1em;
      margin-right: 1em;
      width: 18px;
      height: 18px;
      display: inline-block;
      vertical-align: top;
      margin-top: .1em;
    }
  }

  #top-background {
    .seamless_stars_varied_opacity_repeat {
      background-image: url('@/assets/images/auth/seamless_stars_varied_opacity.png');
      background-repeat: repeat-x;
      position: absolute;
      height: 500px;
      width: 100%;
    }
  }

  .forgot-password {
    color: #bda8ff !important;
  }

  .warning-banner {
    color: $white;
    background-color: $maroon-100;
    height: 2.5rem;
    width: 100%;
  }

  .warning-box {
    font-weight: bold;
    width: 1rem;
    height: 1rem;
    border: 2px solid;
    border-radius: 2px;
  }

  .exclamation {
    width: 2px;
  }

  .strike {
    display: block;
    text-align: center;
    overflow: hidden;
    white-space: nowrap;
  }

  .strike > span {
    font-weight: 700;
    position: relative;
    display: inline-block;
    line-height: 1.714;
    color: #fff;
  }

  .strike > span:before,
  .strike > span:after {
    content: "";
    position: absolute;
    top: 50%;
    width: 9999px;
    height: 1px;
    background: $purple-400;
  }

  .strike > span:before {
    right: 100%;
    margin-right: 15px;
  }

  .strike > span:after {
    left: 100%;
    margin-left: 15px;
  }
</style>

<script>
import axios from 'axios';
import debounce from 'lodash/debounce';
import isEmail from 'validator/es/lib/isEmail';
import PrivacyBanner from '@/components/header/banners/privacy';
import notifications from '@/mixins/notifications';
import sanitizeRedirect from '@/mixins/sanitizeRedirect';
import accountCreation from '@/mixins/accountCreation';
import exclamation from '@/assets/svg/exclamation.svg?raw';
import habiticaIcon from '@/assets/svg/habitica-logo.svg?raw';
import googleIcon from '@/assets/svg/google.svg?raw';
import appleIcon from '@/assets/svg/apple_black.svg?raw';

export default {
  components: {
    PrivacyBanner,
  },
  mixins: [accountCreation, notifications, sanitizeRedirect],
  data () {
    const data = {
      forgotPassword: false,
      resetPasswordSetNewOneData: {
        hasError: null,
        code: null,
      },
      usernameIssues: [],
    };

    data.icons = Object.freeze({
      exclamation,
      habiticaIcon,
      googleIcon,
      appleIcon,
    });

    return data;
  },
  computed: {
    registering () {
      if (this.$route.path.startsWith('/register')) {
        return true;
      }
      return false;
    },
    resetPasswordSetNewOne () {
      if (this.$route.path.startsWith('/reset-password')) {
        return true;
      }
      return false;
    },
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
    $route: {
      handler () {
        this.setTitle();
        if (this.resetPasswordSetNewOne) {
          const { query } = this.$route;
          const { code } = query;
          const hasError = query.hasError === 'true';
          if (hasError) {
            window.alert(query.message); // eslint-disable-line no-alert
            this.$router.push({ name: 'login' });
            return;
          }

          if (!code) {
            window.alert(this.$t('invalidPasswordResetCode')); // eslint-disable-line no-alert
            this.$router.push({ name: 'login' });
            return;
          }
          this.resetPasswordSetNewOneData.code = query.code;
          this.resetPasswordSetNewOneData.hasError = hasError;
        }
      },
      immediate: true,
    },
    username () {
      this.validateUsername(this.username);
    },
  },
  mounted () {
    this.forgotPassword = this.$route.path.startsWith('/forgot-password');
    if (this.forgotPassword) {
      if (this.$route.query.email) {
        this.username = this.$route.query.email;
      }
    }
  },
  methods: {
    async login () {
      await this.$store.dispatch('auth:login', {
        username: this.username,
        password: this.password,
      });

      const redirectTo = this.sanitizeRedirect(this.$route.query.redirectTo);

      window.location.href = redirectTo;
    },
    setTitle () {
      if (this.resetPasswordSetNewOne) {
        return;
      }
      let title = 'login';
      if (this.registering) {
        title = 'register';
      }
      this.$store.dispatch('common:setTitle', {
        section: this.$t(title),
      });
    },
    handleSubmit () {
      if (this.registering) {
        this.proceed('local');
        return;
      }

      if (this.forgotPassword) {
        this.forgotPasswordLink();
        return;
      }

      if (this.resetPasswordSetNewOne) {
        this.resetPasswordSetNewOneLink();
        return;
      }

      this.login();
    },
    async forgotPasswordLink () {
      if (!this.username) {
        window.alert(this.$t('missingEmail')); // eslint-disable-line no-alert
        return;
      }

      await axios.post('/api/v4/user/reset-password', {
        email: this.username,
      });

      window.alert(this.$t('newPassSent')); // eslint-disable-line no-alert
    },
    async resetPasswordSetNewOneLink () {
      if (!this.password) {
        window.alert(this.$t('missingNewPassword')); // eslint-disable-line no-alert
        return;
      }

      if (this.password !== this.passwordConfirm) {
        // @TODO i18n and don't use alerts
        window.alert(this.$t('passwordConfirmationMatch')); // eslint-disable-line no-alert
        return;
      }

      const res = await axios.post('/api/v4/user/auth/reset-password-set-new-one', {
        newPassword: this.password,
        confirmPassword: this.passwordConfirm,
        code: this.resetPasswordSetNewOneData.code,
      });

      if (res.data.message) {
        window.alert(res.data.message); // eslint-disable-line no-alert
      }

      this.password = '';
      this.passwordConfirm = '';
      this.resetPasswordSetNewOneData.code = '';
      this.resetPasswordSetNewOneData.hasError = false;
      this.$router.push({ name: 'login' });
    },
    validateUsername: debounce(function valUsername (username) {
      const usernameIssues = [];
      if (username.length > 0 && !isEmail(username)) {
        if (username.length > 20) {
          usernameIssues.push(this.$t('usernameIssueLength'));
        }
        const invalidCharsRegex = /[^a-z0-9_-]/i;
        const match = username.match(invalidCharsRegex);
        if (match !== null && match[0] !== null) {
          usernameIssues.push(this.$t('usernameIssueInvalidCharacters'));
        }
      }
      this.usernameIssues = usernameIssues;
    }, 500),
  },
};
</script>
