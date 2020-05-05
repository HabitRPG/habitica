<template>
  <form
    @submit.prevent.stop="register"
  >
    <div class="form-group">
      <label
        v-if="!isHomePage"
        v-once
        for="usernameInput">
          {{ $t('username') }}
      </label>
      <input
        id="usernameInput"
        v-model="username"
        class="form-control input-with-error"
        type="text"
        :placeholder="$t(isHomePage?'username':'usernamePlaceholder')"
        :class="{'input-valid': usernameValid, 'input-invalid': usernameInvalid}"
      >
      <div v-for="issue in usernameIssues" :key="issue" class="input-error">{{ issue }}</div>
    </div>
    <div class="form-group">
      <label v-if="!isHomePage" v-once for="emailInput">{{ $t('email') }}</label>
      <input
        id="emailInput"
        v-model="email"
        class="form-control"
        type="email"
        :placeholder="$t(isHomePage?'email':'emailPlaceholder')"
        :class="{'input-invalid': emailInvalid, 'input-valid': emailValid}"
      >
    </div>
    <div class="form-group">
      <label v-if="!isHomePage" v-once for="passwordInput">{{ $t('password') }}</label>
      <input
        id="passwordInput"
        v-model="password"
        class="form-control"
        type="password"
        :placeholder="$t(isHomePage?'password':'passwordPlaceholder')"
        :class="{
            'input-invalid input-with-error': passwordInvalid,
            'input-valid': passwordValid
          }"
      >
      <div v-if="passwordInvalid" class="input-error">{{ $t('minPasswordLength') }}</div>
    </div>
    <div class="form-group">
      <label
        v-if="!isHomePage"
        v-once
        for="confirmPasswordInput">
          {{ $t('confirmPassword') }}
      </label>
      <input
        id="confirmPasswordInput"
        v-model="passwordConfirm"
        class="form-control input-with-error"
        type="password"
        :placeholder="$t(isHomePage?'confirmPassword':'confirmPasswordPlaceholder')"
        :class="{'input-invalid': passwordConfirmInvalid, 'input-valid': passwordConfirmValid}"
      >
      <div v-if="passwordConfirmInvalid" class="input-error">
        {{ $t('passwordConfirmationMatch') }}
      </div>
      <p
        v-if="isHomePage"
        v-once
        class="form-text"
        v-html="$t('termsAndAgreement')"
      ></p>
      <small v-else v-once class="form-text" v-html="$t('termsAndAgreement')"></small>
    </div>
    <div class="text-center">
      <button
        type="submit"
        class="btn btn-block btn-info sign-up"
        :disabled="signupFormInvalid"
        @click="register"
      >{{ $t('signup') }}</button>
      <div class="toggle-links" v-if="!isPlansPage && !isHomePage">
        <router-link :to="{name: 'login'}" exact="exact">
          <a v-once class="toggle-link" v-html="$t('alreadyHaveAccountLogin')"></a>
        </router-link>
      </div>
    </div>
  </form>
</template>

<style lang="scss" scoped>
  @import '~@/assets/scss/colors.scss';
</style>

<script>
import debounce from 'lodash/debounce';
import isEmail from 'validator/lib/isEmail';
import { MINIMUM_PASSWORD_LENGTH } from '@/../../common/script/constants';

export default {
  data () {
    const data = {
      username: '',
      email: '',
      password: '',
      passwordConfirm: '',
      usernameIssues: [],
    };

    return data;
  },
  computed: {
    isHomePage () {
      if (this.$route.path.startsWith('/static/home')) {
        return true;
      }
      return false;
    },
    isRegisterPage () {
      if (this.$route.path.startsWith('/register')) {
        return true;
      }
      return false;
    },
    isPlansPage () {
      if (this.$route.path.startsWith('/static/plans')) {
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
    emailValid () {
      if (this.email.length <= 3) return false;
      return isEmail(this.email);
    },
    emailInvalid () {
      if (this.email.length <= 3) return false;
      return !this.emailValid;
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
    signupFormInvalid () {
      return this.usernameInvalid
        || this.emailInvalid
        || this.passwordInvalid
        || this.passwordConfirmInvalid;
    },
  },
  watch: {
    username () {
      this.validateUsername(this.username);
    },
  },
  methods: {
    // eslint-disable-next-line func-names
    validateUsername: debounce(function (username) {
      if (username.length <= 3) {
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
  },
};
</script>
