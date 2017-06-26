<template lang="pug">
.form-wrapper
  #top-background
    .seamless_stars_varied_opacity_repeat

  #login-form
    .text-center
      div
        .svg-icon.gryphon(v-html="icons.gryphon")
      div
        .svg-icon.habitica-logo(v-html="icons.habiticaIcon")
    .form-group.row.text-center
      .col-6
        .btn.btn-secondary.social-button(@click='socialAuth("facebook")') {{this.registering ? 'Sign up with Facebook' : 'Login with Facebook'}}
      .col-6
        .btn.btn-secondary.social-button(@click='socialAuth("google")') {{this.registering ? 'Sign up with Google' : 'Login with Google'}}
    .form-group
      label(for='usernameInput') Username
      input#usernameInput.form-control(type='text', placeholder='e.g., HabitRabbit', v-model='username')
    .form-group(v-if='registering')
      label(for='emailInput') Email address
      input#emailInput.form-control(type='email', placeholder='e.g., rabbit@habitica.com', v-model='email')
    .form-group
      label(for='passwordInput') Password
      input#passwordInput.form-control(type='password', placeholder='e.g., •••••••••••• ', v-model='password')
    .form-group(v-if='registering')
      label(for='confirmPasswordInput') Confirm Password
      input#confirmPasswordInput.form-control(type='password', placeholder='Make sure it’s the same password!', v-model='passwordConfirm')
      small.form-text By clicking the button below, you are indicating that you have read and agree to the <a href=''>Terms of Service</a> and <a href=''>Privacy Policy</a>.
    .text-center
      .btn.btn-info(@click='register()', v-if='registering') Join Habitica
      .btn.btn-info(@click='login()', v-if='!registering') Login

  #bottom-background
    .seamless_mountains_demo_repeat
    .midground_foreground_extended2
</template>

<style lang="scss" scoped>
  @import '~client/assets/scss/colors.scss';

  .form-wrapper {
    background-color: $purple-200;
  }

  #login-form {
    margin: 0 auto;
    width: 40em;
    padding-top: 5em;
    padding-bottom: 22.5em;
    position: relative;
    z-index: 1;

    .gryphon {
      width: 63.2px;
      height: 69.4px;
    }

    .habitica-logo {
      width: 144px;
      height: 31px;
      margin-top: 2em;
      margin-bottom: 2em;
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
      color: $purple-400;

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
    }

    .form-text {
      font-size: 14px;
      color: $white;
    }

    .social-button {
      width: 100%;
    }
  }

  #top-background {
    .seamless_stars_varied_opacity_repeat {
      background-image: url('~assets/images/auth/seamless_stars_varied_opacity.png');
      background-repeat: repeat-x;
      position: absolute;
      height: 500px;
      width: 1600px;
    }
  }

  #bottom-background {
    position: relative;

    .seamless_mountains_demo_repeat {
      background-image: url('~assets/images/auth/seamless_mountains_demo.png');
      background-repeat: repeat-x;
      width: 1600px;
      height: 500px;
      position: absolute;
      z-index: 0;
      bottom: 0;
    }

    .midground_foreground_extended2 {
      background-image: url('~assets/images/auth/midground_foreground_extended2.png');
      position: relative;
      width: 1500px;
      height: 150px;
    }
  }
</style>

<script>
import hello from 'hellojs';

import gryphon from 'assets/svg/gryphon.svg';
import habiticaIcon from 'assets/svg/habitica-logo.svg';

export default {
  data () {
    let data = {
      username: '',
      email: '',
      password: '',
      passwordConfirm: '',
      registering: true,
    };

    data.icons = Object.freeze({
      gryphon,
      habiticaIcon,
    });

    return data;
  },
  mounted () {
    if (this.$route.path.startsWith('/login')) {
      this.registering = false;
    }

    hello.init({
      facebook: '',
      // windows: WINDOWS_CLIENT_ID,
      google: '',
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

      this.$router.go('/tasks');
    },
    async login () {
      await this.$store.dispatch('auth:login', {
        username: this.username,
        // email: this.email,
        password: this.password,
      });

      this.$router.go('/tasks');
    },
    async socialAuth (network) {
      let auth = await hello(network).login({scope: 'email'});

      await this.$store.dispatch('auth:socialAuth', {
        auth,
      });

      this.$router.go('/tasks');
    },
  },
};
</script>
