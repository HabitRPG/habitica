import isEmail from 'validator/es/lib/isEmail';
import { MINIMUM_PASSWORD_LENGTH } from '@/../../common/script/constants';
import hello from 'hellojs';
import { buildAppleAuthUrl } from '../libs/auth';

export default {
  data () {
    return {
      emailError: null,
      emailValid: false,
      passwordValid: false,
      passwordInvalid: false,
      passwordConfirmValid: false,
      passwordConfirmInvalid: false,
    };
  },
  // @TODO: Abstract hello in to action or lib
  mounted () {
    hello.init({
      google: import.meta.env.GOOGLE_CLIENT_ID, // eslint-disable-line
    });
  },
  methods: {
    async validateEmail () {
      if (!this.email) {
        this.emailValid = false;
        this.emailError = null;
        return;
      }
      if (!isEmail(this.email)) {
        this.emailValid = false;
        this.emailError = this.$t('enterValidEmail');
        return;
      }
      const emailCheck = await this.$store.dispatch('auth:checkEmail', {
        email: this.email,
      });
      if (!emailCheck.valid) {
        this.emailValid = false;
        this.emailError = this.$t('cannotFulfillReq');
        return;
      }
      this.emailValid = true;
      this.emailError = null;
    },
    validatePassword () {
      if (!this.password) {
        this.passwordValid = false;
        this.passwordInvalid = false;
        return;
      }
      this.passwordValid = this.password.length >= MINIMUM_PASSWORD_LENGTH;
      this.passwordInvalid = this.password.length < MINIMUM_PASSWORD_LENGTH;
    },
    validatePasswordConfirm () {
      if (!this.passwordConfirm) {
        this.passwordConfirmValid = false;
        this.passwordConfirmInvalid = false;
        return;
      }
      this.passwordConfirmValid = this.passwordConfirm === this.password;
      this.passwordConfirmInvalid = this.passwordConfirm !== this.password;
    },
    async proceed (accountType) {
      if (accountType === 'local') {
        this.registrationMethod = 'local';
      } else if (accountType === 'apple') {
        window.sessionStorage.setItem('allow-register', 'false');
        window.location.href = buildAppleAuthUrl();
      } else {
        this.authData = await this.socialAuth(accountType);
        const authId = await this.$store.dispatch('auth:socialAuth', {
          auth: this.authData,
          allowRegister: false,
        });
        if (authId) {
          window.location.href = '/';
        } else {
          this.email = window.sessionStorage.getItem('social-email');
          this.registrationMethod = accountType;
        }
      }
    },
    async socialAuth (network) {
      try {
        await hello(network).logout();
      } catch (e) {} // eslint-disable-line

      const redirectUrl = `${window.location.protocol}//${window.location.host}`;
      const auth = await hello(network).login({
        scope: 'email',
        // explicitly pass the redirect url or it might redirect to /home
        redirect_uri: redirectUrl, // eslint-disable-line camelcase
      });
      return auth;
    },
  },
}