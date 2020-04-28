<template>
  <form
    v-if="forgotPassword"
    id="forgot-form"
    @submit.prevent="forgotPasswordLink"
    @keyup.enter="forgotPasswordLink"
  >
    <div class="text-center">
      <div class="header">
        <h2 v-once>
          {{ $t('emailNewPass') }}
        </h2>
        <p v-once>
          {{ $t('forgotPasswordSteps') }}
        </p>
      </div>
    </div>
    <div class="form-group row text-center">
      <label
        v-once
        for="usernameInput"
      >{{ $t('email') }}</label>
      <input
        id="usernameInput"
        v-model="username"
        class="form-control"
        type="text"
        :placeholder="$t('emailPlaceholder')"
      >
    </div>
    <div class="text-center">
      <div
        v-once
        class="btn btn-info"
        @click="forgotPasswordLink()"
      >
        {{ $t('sendLink') }}
      </div>
    </div>
  </form>
  <form
    v-else
    id="login-form"
    @submit.prevent.stop="login"
  >
    <div
      class="form-group"
    >
      <label
        v-once
        for="usernameInput"
      >{{ $t('emailOrUsername') }}</label>
      <input
        id="usernameInput"
        v-model="username"
        class="form-control"
        type="text"
        :placeholder="$t('emailOrUsername')"
      >
    </div>
    <div class="form-group">
      <label
        v-once
        for="passwordInput"
      >{{ $t('password') }}</label>
      <a
        v-once
        class="float-right forgot-password"
        style="color: rgb(189, 168, 255) !important;"
        @click="handleForgotPasswordChange"
      >{{ $t('forgotPassword') }}</a>
      <input
        id="passwordInput"
        v-model="password"
        class="form-control"
        type="password"
        :placeholder="$t('password')"
      >
    </div>
    <div class="text-center">
      <button
        v-once
        type="submit"
        class="btn btn-info"
      >
        {{ $t('login') }}
      </button>
      <div class="toggle-links">
        <router-link
          :to="{name: 'register'}"
          exact="exact"
        >
          <a
            v-once
            class="toggle-link"
            v-html="$t('dontHaveAccountSignup')"
          ></a>
        </router-link>
      </div>
    </div>
  </form>
</template>

<style lang="scss" scoped>
  @import '~@/assets/scss/colors.scss';
  #login-form, #forgot-form {
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

    margin: 0 auto;
    width: 40em;
    padding-top: 0em !important;
    padding-bottom: 0em !important;
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

    .toggle-links {
      margin-top: 1em;
    }

    .toggle-link {
      color: $white !important;
    }
  }
</style>

<script>
import axios from 'axios';

export default {
  data () {
    const data = {
      username: '',
      password: '',
      forgotPassword: false,
    };

    return data;
  },
  methods: {
    handleForgotPasswordChange () {
      this.forgotPassword = true;
      this.$emit('forgotPassword', true);
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
  },
};
</script>
