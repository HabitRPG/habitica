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
    <reset-password-form v-if="resetPasswordSetNewOne" />
    <div
      v-else
      id="auth-form"
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
      <div v-if="!forgotPassword">
        <div class="form-group row text-center">
          <div class="col-12 col-md-12">
            <social-auth-form network="facebook" :login="!registering" class="btn btn-secondary"/>
          </div>
        </div>
        <div class="form-group row text-center">
          <div class="col-12 col-md-12">
            <social-auth-form network="google" :login="!registering" class="btn btn-secondary"/>
          </div>
        </div>
        <div class="form-group row text-center">
          <div class="col-12 col-md-12">
            <social-auth-form network="apple" :login="!registering" class="btn btn-secondary"/>
          </div>
        </div>
        <div class="strike">
          <span>{{ $t('or') }}</span>
        </div>
      </div>
      <login-form v-if="!registering" @forgotPassword="forgotPassword = true"/>
      <register-form v-if="registering" class="register-form"/>
    </div>
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
    #auth {
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

  #auth-form {
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
    ::v-deep .register-form {
      margin: 0 auto;
      width: 40em;
      position: relative;
      z-index: 1;

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

      .toggle-links {
        margin-top: 1em;
      }

      .toggle-link {
        color: $white !important;
      }

      .input-error {
        color: #fff;
        font-size: 90%;
        width: 100%;
      }
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
import moment from 'moment';
import socialAuthForm from './socialAuth';

import exclamation from '@/assets/svg/exclamation.svg';
import gryphon from '@/assets/svg/gryphon.svg';
import habiticaIcon from '@/assets/svg/habitica-logo.svg';
import loginForm from './login';
import registerForm from './register';
import resetPasswordForm from './reset';

export default {
  components: {
    socialAuthForm,
    loginForm,
    registerForm,
    resetPasswordForm,
  },
  data () {
    const data = {
      forgotPassword: false,
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
    /*
      preOutage always return false, but i'm not gonna delete
      these code snippets cause Habitica emails may be unavailable
      again.
    */
    preOutage () {
      return moment.utc().isBefore('2020-01-12');
    },
  },
};
</script>
