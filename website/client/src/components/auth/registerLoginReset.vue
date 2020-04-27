<template>
  <div class="form-wrapper">
    <div
      v-if="forgotPassword && preOutage"
      class="warning-banner d-flex"
    >
      <div class="warning-box ml-auto my-auto mr-2 d-flex">
        <div
          class="svg-icon exclamation m-auto"
          v-html="icons.exclamation"
        >
        </div>
      </div>
      <div class="mr-auto my-auto">
        Habitica emails will be temporarily unavailable on <strong>January 11, 2020</strong> from
        <strong>1:00 - 7:00 AM EST</strong>.
      </div>
    </div>
    <div id="top-background">
      <div class="seamless_stars_varied_opacity_repeat"></div>
    </div>
    <div
      v-if="!forgotPassword && !resetPasswordSetNewOne"
      id="login-form"
    >
      <div class="text-center">
        <div>
          <div class="svg-icon gryphon"></div>
        </div>
        <div>
          <div
            class="svg-icon habitica-logo"
            v-html="icons.habiticaIcon"
          ></div>
        </div>
      </div>
      <div class="form-group row text-center">
        <div class="col-12 col-md-12">
          <facebook-auth />
        </div>
      </div>
      <div class="form-group row text-center">
        <div class="col-12 col-md-12">
          <google-auth />
        </div>
      </div>
      <div class="form-group row text-center">
        <div class="col-12 col-md-12">
          <apple-auth />
        </div>
      </div>
      <div class="strike">
        <span>{{ $t('or') }}</span>
      </div>
      <login-form v-if="!registering" />
      <register-form v-if="registering" />
    </div>
    <reset-password-form v-if="resetPasswordSetNewOne" />
    <div
      id="bottom-wrap"
      :class="`bottom-wrap-${!registering ? 'login' : 'register'}`"
    >
      <div id="bottom-background">
        <div class="seamless_mountains_demo_repeat"></div>
        <div class="midground_foreground_extended2"></div>
      </div>
    </div>
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
  @import '~@/assets/scss/colors.scss';

  @media only screen  and (min-height: 1080px) {
    .bottom-wrap-register {
      margin-top: 6em;
      position: fixed !important;
      width: 100%;
      bottom: 0;
    }
  }

  @media only screen  and (min-height: 862px) {
    .bottom-wrap-login {
      margin-top: 6em;
      position: fixed !important;
      width: 100%;
      bottom: 0;
    }
  }

  @media only screen and (max-width: 768px) {
    #login-form {
      width: 100% !important;
    }

    .form-group {
      padding-left: .5em;
      padding-right: .5em;
    }
  }

  .form-wrapper {
    background-color: $purple-200;
    background: $purple-200; /* For browsers that do not support gradients */
    background: linear-gradient(to bottom, #4f2a93, #6133b4); /* Standard syntax */
    min-height: 100vh;
  }

  ::-webkit-input-placeholder { /* Chrome/Opera/Safari */
    color: $purple-400;
  }
  ::-moz-placeholder { /* Firefox 19+ */
    color: $purple-400;
  }
  :-ms-input-placeholder { /* IE 10+ */
    color: $purple-400;
  }
  :-moz-placeholder { /* Firefox 18- */
    color: $purple-400;
  }
  ::placeholder { //  Standard browsers
    color: $purple-400;
  }

  #login-form, #reset-password-set-new-one-form {
    margin: 0 auto;
    width: 40em;
    padding-top: 5em;
    padding-bottom: 4em;
    position: relative;
    z-index: 1;

    .header {
      h2 {
        color: $white;
      }

      color: $white;
    }

    .gryphon {
      background-image: url('~@/assets/images/melior@3x.png');
      width: 63.2px;
      height: 69.4px;
      background-size: cover;
      color: $white;
      margin: 0 auto;
    }

    .habitica-logo {
      width: 144px;
      height: 31px;
      margin: 2em auto;
    }

    label {
      color: $white;
      font-weight: bold;
    }

    input {
      margin-bottom: 2em;
      border-radius: 2px;
      background-color: #432874;
      border-color: transparent;
      height: 50px;
      color: $white;
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


  }

  #top-background {
    .seamless_stars_varied_opacity_repeat {
      background-image: url('~@/assets/images/auth/seamless_stars_varied_opacity.png');
      background-repeat: repeat-x;
      position: absolute;
      height: 500px;
      width: 100%;
    }
  }

  #bottom-wrap {
    margin-top: 6em;
    position: static;
    width: 100%;
    bottom: 0;
  }

  #bottom-background {
    position: relative;

    .seamless_mountains_demo_repeat {
      background-image: url('~@/assets/images/auth/seamless_mountains_demo.png');
      background-repeat: repeat-x;
      width: 100%;
      height: 300px;
      position: absolute;
      z-index: 0;
      bottom: 0;
    }

    .midground_foreground_extended2 {
      background-image: url('~@/assets/images/auth/midground_foreground_extended2.png');
      position: relative;
      width: 1500px;
      max-width: 100%;
      height: 150px;
      margin: 0 auto;
    }
  }

  .toggle-links {
    margin-top: 1em;
  }

  .toggle-link {
    color: $white !important;
  }

  .forgot-password {
    color: #bda8ff !important;
  }

  .input-error {
    color: #fff;
    font-size: 90%;
    width: 100%;
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
    margin-top: 1.5em;
    margin-bottom: 1.5em;
  }

  .strike > span {
    position: relative;
    display: inline-block;
    line-height: 1.14;
    color: #fff;
  }

  .strike > span:before,
  .strike > span:after {
    content: "";
    position: absolute;
    top: 50%;
    width: 9999px;
    height: 1px;
    background: #fff;
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
import hello from 'hellojs';
import moment from 'moment';
import debounce from 'lodash/debounce';
import isEmail from 'validator/lib/isEmail';
import appleAuth from './socialAuth/apple';
import facebookAuth from './socialAuth/facebook';
import googleAuth from './socialAuth/google';

import { MINIMUM_PASSWORD_LENGTH } from '@/../../common/script/constants';
import exclamation from '@/assets/svg/exclamation.svg';
import gryphon from '@/assets/svg/gryphon.svg';
import habiticaIcon from '@/assets/svg/habitica-logo.svg';
import loginForm from './login';
import registerForm from './register';
import resetPasswordForm from './reset';

export default {
  components: {
    appleAuth,
    facebookAuth,
    googleAuth,
    loginForm,
    registerForm,
    resetPasswordForm,
  },
  data () {
    const data = {
      username: '',
      email: '',
      password: '',
      passwordConfirm: '',
      forgotPassword: false,
      resetPasswordSetNewOneData: {
        hasError: null,
        code: null,
      },
      usernameIssues: [],
    };

    data.icons = Object.freeze({
      exclamation,
      gryphon,
      habiticaIcon,
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
    preOutage () {
      return moment.utc().isBefore('2020-01-12');
    },
  },
  watch: {
    $route: {
      handler () {
        if (this.resetPasswordSetNewOne) {
          const { query } = this.$route;
          const { code } = query;
          const hasError = query.hasError === 'true';
          if (hasError) {
            window.alert(query.message);
            this.$router.push({ name: 'login' });
            return;
          }

          if (!code) {
            window.alert(this.$t('invalidPasswordResetCode'));
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
    hello.init({
      facebook: process.env.FACEBOOK_KEY, // eslint-disable-line
      // windows: WINDOWS_CLIENT_ID,
      google: process.env.GOOGLE_CLIENT_ID, // eslint-disable-line
    });
  },
  methods: {
    // eslint-disable-next-line func-names
    validateUsername: debounce(function (username) {
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
    async register () {
      // @TODO do not use alert
      if (!this.email) {
        window.alert(this.$t('missingEmail'));
        return;
      }

      if (this.password !== this.passwordConfirm) {
        window.alert(this.$t('passwordConfirmationMatch'));
        return;
      }

      // @TODO: implement language and invite accepting
      // var url = ApiUrl.get() + "/api/v4/user/auth/local/register";
      // if (location.search && location.search.indexOf('Invite=') !== -1)
      // { // matches groupInvite and partyInvite
      //   url += location.search;
      // }
      //
      // if($rootScope.selectedLanguage) {
      //   var toAppend = url.indexOf('?') !== -1 ? '&' : '?';
      //   url = url + toAppend + 'lang=' + $rootScope.selectedLanguage.code;
      // }

      await this.$store.dispatch('auth:register', {
        username: this.username,
        email: this.email,
        password: this.password,
        passwordConfirm: this.passwordConfirm,
      });

      let redirectTo;

      if (this.$route.query.redirectTo) {
        redirectTo = this.$route.query.redirectTo;
      } else {
        redirectTo = '/';
      }

      // @TODO do not reload entire page
      // problem is that app.vue created hook should be called again
      // after user is logged in / just signed up
      // ALSO it's the only way to make sure language data
      // is reloaded and correct for the logged in user
      window.location.href = redirectTo;
    },
    async login () {
      await this.$store.dispatch('auth:login', {
        username: this.username,
        // email: this.email,
        password: this.password,
      });

      let redirectTo;

      if (this.$route.query.redirectTo) {
        redirectTo = this.$route.query.redirectTo;
      } else {
        redirectTo = '/';
      }

      // @TODO do not reload entire page
      // problem is that app.vue created hook should be called again
      // after user is logged in / just signed up
      // ALSO it's the only way to make sure language data
      // is reloaded and correct for the logged in user
      window.location.href = redirectTo;
    },
    handleSubmit () {
      if (this.registering) {
        this.register();
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
        window.alert(this.$t('missingEmail'));
        return;
      }

      await axios.post('/api/v4/user/reset-password', {
        email: this.username,
      });

      window.alert(this.$t('newPassSent'));
    },
    async resetPasswordSetNewOneLink () {
      if (!this.password) {
        window.alert(this.$t('missingNewPassword'));
        return;
      }

      if (this.password !== this.passwordConfirm) {
        // @TODO i18n and don't use alerts
        window.alert(this.$t('passwordConfirmationMatch'));
        return;
      }

      const res = await axios.post('/api/v4/user/auth/reset-password-set-new-one', {
        newPassword: this.password,
        confirmPassword: this.passwordConfirm,
        code: this.resetPasswordSetNewOneData.code,
      });

      if (res.data.message) {
        window.alert(res.data.message);
      }

      this.password = '';
      this.passwordConfirm = '';
      this.resetPasswordSetNewOneData.code = '';
      this.resetPasswordSetNewOneData.hasError = false;
      this.$router.push({ name: 'login' });
    },
  },
};
</script>
