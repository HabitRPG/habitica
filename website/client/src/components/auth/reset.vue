<template>
  <form
    id="reset-password-set-new-one-form"
    @submit.prevent="handleSubmit"
    @keyup.enter="handleSubmit"
  >
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
        @click="resetPasswordSetNewOneLin"
      >
        {{ $t('setNewPass') }}
      </div>
    </div>
  </form>
</template>

<style lang="scss" scoped>
  @import '~@/assets/scss/colors.scss';
  #reset-password-set-new-one-form {
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
import { MINIMUM_PASSWORD_LENGTH } from '@/../../common/script/constants';

export default {
  data () {
    return {
      password: '',
      passwordConfirm: '',
      resetPasswordSetNewOneData: {
        hasError: null,
        code: null,
      },
    };
  },
  computed: {
    passwordValid () {
      if (this.password.length <= 0) return false;
      return this.password.length >= MINIMUM_PASSWORD_LENGTH;
    },
    passwordInvalid () {
      if (this.password.length <= 0) return false;
      return this.password.length < MINIMUM_PASSWORD_LENGTH;
    },
  },
  watch: {
    $route: {
      handler () {
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
      },
      immediate: true,
    },
  },
  methods: {
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
