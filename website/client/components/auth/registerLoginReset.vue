<template lang="pug">
.form-wrapper
  #top-background
    .seamless_stars_varied_opacity_repeat

  form#login-form(
    @submit.prevent='handleSubmit',
    @keyup.enter="handleSubmit",
    v-if="!forgotPassword && !resetPasswordSetNewOne",
  )
    .text-center
      div
        .svg-icon.gryphon
      div
        .svg-icon.habitica-logo(v-html="icons.habiticaIcon")
    .form-group.row.text-center
      .col-12.col-md-6
        .btn.btn-secondary.social-button(@click='socialAuth("facebook")')
          .svg-icon.social-icon(v-html="icons.facebookIcon")
          .text {{registering ? $t('signUpWithSocial', {social: 'Facebook'}) : $t('loginWithSocial', {social: 'Facebook'})}}
      .col-12.col-md-6
        .btn.btn-secondary.social-button(@click='socialAuth("google")')
          .svg-icon.social-icon(v-html="icons.googleIcon")
          span {{registering ? $t('signUpWithSocial', {social: 'Google'}) : $t('loginWithSocial', {social: 'Google'})}}
    .form-group(v-if='registering')
      label(for='usernameInput', v-once) {{$t('username')}}
      input#usernameInput.form-control(type='text', :placeholder='$t("usernamePlaceholder")', v-model='username')
    .form-group(v-if='!registering')
      label(for='usernameInput', v-once) {{$t('emailOrUsername')}}
      input#usernameInput.form-control(type='text', :placeholder='$t("emailOrUsername")', v-model='username')
    .form-group(v-if='registering')
      label(for='emailInput', v-once) {{$t('email')}}
      input#emailInput.form-control(type='email', :placeholder='$t("emailPlaceholder")', v-model='email')
    .form-group
      label(for='passwordInput', v-once) {{$t('password')}}
      a.float-right.forgot-password(v-once, v-if='!registering', @click='forgotPassword = true') {{$t('forgotPassword')}}
      input#passwordInput.form-control(type='password', :placeholder='$t(registering ? "passwordPlaceholder" : "password")', v-model='password')
    .form-group(v-if='registering')
      label(for='confirmPasswordInput', v-once) {{$t('confirmPassword')}}
      input#confirmPasswordInput.form-control(type='password', :placeholder='$t("confirmPasswordPlaceholder")', v-model='passwordConfirm')
      small.form-text(v-once, v-html="$t('termsAndAgreement')")
    .text-center
      .btn.btn-info(@click='register()', v-if='registering', v-once) {{$t('joinHabitica')}}
      .btn.btn-info(@click='login()', v-if='!registering', v-once) {{$t('login')}}
      .toggle-links
        router-link(:to="{name: 'login'}", v-if='registering', exact)
          a.toggle-link(v-once, v-html="$t('alreadyHaveAccountLogin')")
        router-link(:to="{name: 'register'}",  v-if='!registering', exact)
          a.toggle-link(v-once, v-html="$t('dontHaveAccountSignup')")

  form#forgot-form(v-on:submit.prevent='handleSubmit', @keyup.enter="handleSubmit", v-if='forgotPassword')
    .text-center
      div
        .svg-icon.gryphon
      div
        .svg-icon.habitica-logo(v-html="icons.habiticaIcon")
      .header
        h2(v-once) {{ $t('emailNewPass') }}
        p(v-once) {{ $t('forgotPasswordSteps') }}
    .form-group.row.text-center
      label(for='usernameInput', v-once) {{$t('email')}}
      input#usernameInput.form-control(type='text', :placeholder='$t("emailPlaceholder")', v-model='username')
    .text-center
      .btn.btn-info(@click='forgotPasswordLink()', v-once) {{$t('sendLink')}}

  form#reset-password-set-new-one-form(v-on:submit.prevent='handleSubmit', @keyup.enter="handleSubmit", v-if='resetPasswordSetNewOne')
    .text-center
      div
        .svg-icon.gryphon
      div
        .svg-icon.habitica-logo(v-html="icons.habiticaIcon")
      .header
        h2 {{ $t('passwordResetPage') }}
    .form-group
      label(for='passwordInput', v-once) {{$t('newPass')}}
      input#passwordInput.form-control(type='password', :placeholder="$t('password')", v-model='password')
    .form-group
      label(for='confirmPasswordInput', v-once) {{$t('confirmPass')}}
      input#confirmPasswordInput.form-control(type='password', :placeholder='$t("confirmPasswordPlaceholder")', v-model='passwordConfirm')
    .text-center
      .btn.btn-info(
        @click='resetPasswordSetNewOneLink()',
        :enabled="!resetPasswordSetNewOneData.hasError"
      )  {{$t('setNewPass')}}

  #bottom-wrap(:class="`bottom-wrap-${!registering ? 'login' : 'register'}`")
    #bottom-background
      .seamless_mountains_demo_repeat
      .midground_foreground_extended2
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
  @import '~client/assets/scss/colors.scss';

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

  #login-form, #forgot-form, #reset-password-set-new-one-form {
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
      background-image: url('~assets/images/melior@3x.png');
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

    .form-text {
      font-size: 14px;
      color: $white;
    }

    .social-button {
      width: 100%;
      text-align: center;

      .text {
        display: inline-block;
      }
    }

    .social-icon {
      margin-right: 1em;
      width: 18px;
      height: 18px;
      display: inline-block;
      vertical-align: top;
      margin-top: .2em;
    }
  }

  #top-background {
    .seamless_stars_varied_opacity_repeat {
      background-image: url('~assets/images/auth/seamless_stars_varied_opacity.png');
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
      background-image: url('~assets/images/auth/seamless_mountains_demo.png');
      background-repeat: repeat-x;
      width: 100%;
      height: 500px;
      position: absolute;
      z-index: 0;
      bottom: 0;
    }

    .midground_foreground_extended2 {
      background-image: url('~assets/images/auth/midground_foreground_extended2.png');
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
</style>

<script>
import axios from 'axios';
import hello from 'hellojs';

import gryphon from 'assets/svg/gryphon.svg';
import habiticaIcon from 'assets/svg/habitica-logo.svg';
import facebookSquareIcon from 'assets/svg/facebook-square.svg';
import googleIcon from 'assets/svg/google.svg';

export default {
  data () {
    let data = {
      username: '',
      email: '',
      password: '',
      passwordConfirm: '',
      forgotPassword: false,
      resetPasswordSetNewOneData: {
        hasError: null,
        code: null,
      },
    };

    data.icons = Object.freeze({
      gryphon,
      habiticaIcon,
      facebookIcon: facebookSquareIcon,
      googleIcon,
    });

    return data;
  },
  computed: {
    registering () {
      if (this.$route.path.startsWith('/login')) {
        return false;
      }
      return true;
    },
    resetPasswordSetNewOne () {
      if (this.$route.path.startsWith('/reset-password')) {
        return true;
      }
      return false;
    },
  },
  mounted () {
    hello.init({
      facebook: process.env.FACEBOOK_KEY, // eslint-disable-line
      // windows: WINDOWS_CLIENT_ID,
      google: process.env.GOOGLE_CLIENT_ID, // eslint-disable-line
    });
  },
  watch: {
    $route: {
      handler () {
        if (this.resetPasswordSetNewOne) {
          const query = this.$route.query;
          const code = query.code;
          const hasError =  query.hasError === 'true' ? true : false;
          if (hasError) {
            alert(query.message);
            this.$router.push({name: 'login'});
            return;
          }

          if (!code) {
            alert(this.$t('invalidPasswordResetCode'));
            this.$router.push({name: 'login'});
            return;
          }

          this.resetPasswordSetNewOneData.code = query.code;
          this.resetPasswordSetNewOneData.hasError = hasError;
        }
      },
      immediate: true,
    },
  },
  methods: {
    async register () {
      // @TODO do not use alert
      if (!this.email) {
        alert(this.$t('missingEmail'));
        return;
      }

      if (this.password !== this.passwordConfirm) {
        alert(this.$t('passwordConfirmationMatch'));
        return;
      }

      // @TODO: implement langauge and invite accepting
      // var url = ApiUrl.get() + "/api/v3/user/auth/local/register";
      // if (location.search && location.search.indexOf('Invite=') !== -1) { // matches groupInvite and partyInvite
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
      // ALSO it's the only way to make sure language data is reloaded and correct for the logged in user
      window.location.href = redirectTo;
    },
    async login () {
      if (!this.username) {
        alert('Email is required');
        return;
      }

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
      // ALSO it's the only way to make sure language data is reloaded and correct for the logged in user
      window.location.href = redirectTo;
    },
    async socialAuth (network) {
      const url = window.location.href;

      let auth = await hello(network).login({
        scope: 'email',
        // explicitly pass the redirect url or it might redirect to /home
        redirect_uri: url, // eslint-disable-line camelcase
      });

      await this.$store.dispatch('auth:socialAuth', {
        auth,
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
      // ALSO it's the only way to make sure language data is reloaded and correct for the logged in user
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
        alert(this.$t('missingEmail'));
        return;
      }

      await axios.post('/api/v3/user/reset-password', {
        email: this.username,
      });

      alert(this.$t('newPassSent'));
    },
    async resetPasswordSetNewOneLink () {
      if (!this.password) {
        alert(this.$t('missingNewPassword'));
        return;
      }

      if (this.password !== this.passwordConfirm) {
        // @TODO i18n and don't use alerts
        alert(this.$t('passwordConfirmationMatch'));
        return;
      }

      const res = await axios.post('/api/v3/user/auth/reset-password-set-new-one', {
        newPassword: this.password,
        confirmPassword: this.passwordConfirm,
        code: this.resetPasswordSetNewOneData.code,
      });

      if (res.data.message) {
        alert(res.data.message);
      }

      this.password = '';
      this.passwordConfirm = '';
      this.resetPasswordSetNewOneData.code = '';
      this.resetPasswordSetNewOneData.hasError = false;
      this.$router.push({name: 'login'});
    },
  },
};
</script>
