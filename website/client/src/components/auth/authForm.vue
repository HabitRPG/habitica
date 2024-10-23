<template>
  <div class="form">
    <div v-if="emailExistsError" class="input-error">{{ $t('emailDoesNotExist') }}</div>
    <div class="form-group row text-center">
      <div class="col-12">
        <div
          class="btn btn-secondary social-button"
          @click="socialAuth('google')"
        >
          <div class="svg-icon social-icon" v-html="icons.googleIcon"></div>
          <span>{{ registering
            ? $t('signUpWithSocial', {social: 'Google'})
            : $t('loginWithSocial', {social: 'Google'}) }}</span>
        </div>
      </div>
    </div>
    <div class="form-group row text-center">
      <div class="col-12">
        <div
          class="btn btn-secondary social-button"
          @click="socialAuth('apple')"
        >
          <div class="svg-icon social-icon apple-icon" v-html="icons.appleIcon"></div>
          <span>{{ registering
            ? $t('signUpWithSocial', {social: 'Apple'})
            : $t('loginWithSocial', {social: 'Apple'}) }}</span>
        </div>
      </div>
    </div>
    <div v-if="registering" class="form-group">
      <label v-once for="usernameInput">{{ $t('username') }}</label>
      <input
        id="usernameInput"
        v-model="username"
        class="form-control"
        type="text"
        :placeholder="$t('usernamePlaceholder')"
        :class="{'input-valid': usernameValid, 'input-invalid': usernameInvalid}"
      >
      <div v-for="issue in usernameIssues" :key="issue" class="input-error">
        {{ issue }}
      </div>
    </div>
    <div v-if="!registering" class="form-group">
      <label v-once for="usernameInput">{{ $t('emailOrUsername') }}</label>
      <input
        id="usernameInput"
        v-model="username"
        class="form-control"
        type="text"
        :placeholder="$t('emailOrUsername')"
      >
    </div>
    <div v-if="registering" class="form-group">
      <label v-once for="emailInput">{{ $t('email') }}</label>
      <input
        id="emailInput"
        v-model="email"
        class="form-control"
        type="email"
        :placeholder="$t('emailPlaceholder')"
        :class="{'input-invalid': emailInvalid || emailExistsError, 'input-valid': emailValid}"
        @blur="checkEmailExists"
      >
    </div>
    <div class="form-group">
      <label v-once for="passwordInput">{{ $t('password') }}</label>
      <a v-if="!registering" v-once class="float-right forgot-password" @click="forgotPassword = true">{{ $t('forgotPassword') }}</a>
      <input
        id="passwordInput"
        v-model="password"
        class="form-control"
        type="password"
        :placeholder="$t(registering ? 'passwordPlaceholder' : 'password')"
        :class="{
          'input-valid': registering ? passwordValid : false,
          'input-invalid': registering ? passwordInvalid : false,
        }"
      >
      <div v-if="passwordInvalid && registering" class="input-error">
        {{ $t('minPasswordLength') }}
      </div>
    </div>
    <div v-if="registering" class="form-group">
      <label v-once for="confirmPasswordInput">{{ $t('confirmPassword') }}</label>
      <input
        id="confirmPasswordInput"
        v-model="passwordConfirm"
        class="form-control"
        type="password"
        :placeholder="$t('confirmPasswordPlaceholder')"
        :class="{'input-invalid': passwordConfirmInvalid, 'input-valid': passwordConfirmValid}"
      >
      <div v-if="passwordConfirmInvalid" class="input-error">
        {{ $t('passwordConfirmationMatch') }}
      </div>
      <small v-once class="form-text" v-html="$t('termsAndAgreement')"></small>
    </div>
    <div class="text-center">
      <div v-if="registering" v-once class="btn btn-info" @click="register">
        {{ $t('joinHabitica') }}
      </div>
      <div v-if="!registering" v-once class="btn btn-info" @click="login">
        {{ $t('login') }}
      </div>
    </div>
  </div>
</template>

<script>
import hello from 'hellojs';
import debounce from 'lodash/debounce';
import isEmail from 'validator/es/lib/isEmail';
import { MINIMUM_PASSWORD_LENGTH } from '@/../../common/script/constants';
import { setUpAxios, buildAppleAuthUrl } from '@/libs/auth';
import googleIcon from '@/assets/svg/google.svg';
import appleIcon from '@/assets/svg/apple_black.svg';

export default {
  name: 'AuthForm',
  data () {
    const data = {
      registering: true,
      username: '',
      email: '',
      password: '',
      passwordConfirm: '',
      usernameIssues: [],
      emailExistsError: false,
    };

    data.icons = Object.freeze({
      googleIcon,
      appleIcon,
    });

    return data;
  },
  computed: {
    emailValid () {
      if (this.email.length <= 3) return false;
      return isEmail(this.email);
    },
    emailInvalid () {
      if (this.email.length <= 3) return false;
      return !this.emailValid;
    },
    usernameValid () {
      if (this.username.length < 1) return false;
      return this.usernameIssues.length === 0;
    },
    usernameInvalid () {
      if (this.username.length < 1) return false;
      return !this.usernameValid;
    },
    passwordValid () {
      if (this.password.length <= 0) return false;
      return this.password.length >= MINIMUM_PASSWORD_LENGTH;
    },
    passwordInvalid () {
      if (this.password.length <= 0) return false;
      return this.password.length < MINIMUM_PASSWORD_LENGTH;
    },
    passwordConfirmValid () {
      if (this.passwordConfirm.length <= 3) return false;
      return this.passwordConfirm === this.password;
    },
    passwordConfirmInvalid () {
      if (this.passwordConfirm.length <= 3) return false;
      return !this.passwordConfirmValid;
    },
  },
  methods: {
    async checkEmailExists () {
      if (!this.emailValid) return;

      try {
        const res = await this.$store.dispatch('auth:verifyEmail', { email: this.email });
        this.emailExistsError = !res.exists;
      } catch (e) {
        console.error(e); // Handle error
      }
    },
    async register () {
      if (this.emailExistsError || !this.emailValid) return;

      if (!this.email) {
        window.alert(this.$t('missingEmail'));
        return;
      }

      if (this.password !== this.passwordConfirm) {
        window.alert(this.$t('passwordConfirmationMatch'));
        return;
      }

      try {
        await this.$store.dispatch('auth:register', {
          username: this.username,
          email: this.email,
          password: this.password,
          passwordConfirm: this.passwordConfirm,
        });

        await this.finishAuth();
      } catch (e) {
        if (e.response.data.data && e.response.data.data.errors) {
          const message = e.response.data.data.errors.map(error => `${error.message}\n`);
          window.alert(message);
        }
      }
    },
    async finishAuth () {
      setUpAxios();

      await this.$store.dispatch('user:fetch', { forceLoad: true });

      this.$emit('authenticate');
    },
  },
};
</script>
