<template lang="pug">
.form-wrapper
  #top-background
    .seamless_stars_varied_opacity_repeat

  form#login-form(v-on:submit.prevent='handleSubmit', @keyup.enter="handleSubmit")
    .text-center
      div
        .svg-icon.gryphon(v-html="icons.gryphon")
      div
        .svg-icon.habitica-logo(v-html="icons.habiticaIcon")
    .form-group.row.text-center
      .col-6
        .btn.btn-secondary.social-button(@click='socialAuth("facebook")', v-once)
          .svg-icon.social-icon(v-html="icons.facebookIcon")
          .text {{this.registering ? $t('signUpWithSocial', {social: 'Facebook'}) : $t('loginWithSocial', {social: 'Facebook'})}}
      .col-6
        .btn.btn-secondary.social-button(@click='socialAuth("google")', v-once)
          .svg-icon.social-icon(v-html="icons.googleIcon")
          span {{this.registering ? $t('signUpWithSocial', {social: 'Google'}) : $t('loginWithSocial', {social: 'Google'})}}
    .form-group(v-if='registering')
      label(for='usernameInput', v-once) {{$t('username')}}
      input#usernameInput.form-control(type='text', :placeholder='$t("usernamePlaceholder")', v-model='username')
    .form-group(v-if='!registering')
      label(for='usernameInput', v-once) {{$t('emailOrUsername')}}
      input#usernameInput.form-control(type='text', :placeholder='$t("emailPlaceholder")', v-model='username')
    .form-group(v-if='registering')
      label(for='emailInput', v-once) {{$t('email')}}
      input#emailInput.form-control(type='email', :placeholder='$t("emailPlaceholder")', v-model='email')
    .form-group
      label(for='passwordInput', v-once) {{$t('password')}}
      input#passwordInput.form-control(type='password', :placeholder='$t("passwordPlaceholder")', v-model='password')
    .form-group(v-if='registering')
      label(for='confirmPasswordInput', v-once) {{$t('confirmPassword')}}
      input#confirmPasswordInput.form-control(type='password', :placeholder='$t("confirmPasswordPlaceholder")', v-model='passwordConfirm')
      small.form-text(v-once, v-html="$t('termsAndAgreement')")
    .text-center
      .btn.btn-info(@click='register()', v-if='registering', v-once) {{$t('joinHabitica')}}
      .btn.btn-info(@click='login()', v-if='!registering', v-once) {{$t('login')}}
      .toggle-links
        router-link(:to="{name: 'login'}", v-if='registering', exact)
          a.toggle-link(v-once) {{ $t('alreadyHaveAccountLogin') }}
        router-link(:to="{name: 'register'}",  v-if='!registering', exact)
          a.toggle-link(v-once) Don't have an account? Join Habitica!

  #bottom-wrap
    #bottom-background
      .seamless_mountains_demo_repeat
      .midground_foreground_extended2
</template>

<style>
  html, body, #app {
    min-height: 100%;
  }

  small a {
    color: #fff;
    text-decoration: underline;
  }
</style>

<style lang="scss" scoped>
  @import '~client/assets/scss/colors.scss';

  .form-wrapper {
    background-color: $purple-200;
    background: $purple-200; /* For browsers that do not support gradients */
    background: -webkit-linear-gradient(to bottom, #4f2a93, #6133b4); /* For Safari 5.1 to 6.0 */
    background: -o-linear-gradient(to bottom, #4f2a93, #6133b4); /* For Opera 11.1 to 12.0 */
    background: -moz-linear-gradient(to bottom, #4f2a93, #6133b4); /* For Firefox 3.6 to 15 */
    background: linear-gradient(to bottom, #4f2a93, #6133b4); /* Standard syntax */
    min-height: 100%;
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

  #login-form {
    margin: 0 auto;
    width: 40em;
    padding-top: 5em;
    padding-bottom: 4em;
    position: relative;
    z-index: 1;

    .gryphon {
      width: 63.2px;
      height: 69.4px;
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
    color: #fff !important;
  }
</style>

<script>
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
  },
  mounted () {
    hello.init({
      facebook: process.env.FACEBOOK_KEY, // eslint-disable-line
      // windows: WINDOWS_CLIENT_ID,
      google: process.env.GOOGLE_CLIENT_ID, // eslint-disable-line
    });
  },
  methods: {
    async register () {
      if (this.password !== this.passwordConfirm) {
        alert('Passwords must match');
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

      window.location.href = '/';
    },
    async login () {
      await this.$store.dispatch('auth:login', {
        username: this.username,
        // email: this.email,
        password: this.password,
      });

      window.location.href = '/';
    },
    async socialAuth (network) {
      let auth = await hello(network).login({scope: 'email'});

      await this.$store.dispatch('auth:socialAuth', {
        auth,
      });

      window.location.href = '/';
    },
    handleSubmit () {
      if (this.registering) {
        this.register();
        return;
      }

      this.login();
    },
  },
};
</script>
