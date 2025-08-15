import debounce from 'lodash/debounce';
import isEmail from 'validator/es/lib/isEmail';
import { MINIMUM_PASSWORD_LENGTH } from '@/../../common/script/constants';
import hello from 'hellojs';
import { buildAppleAuthUrl } from '../libs/auth';

export default {
  data () {
    return {
      authData: {},
      email: '',
      emailError: null,
      emailValid: false,
      password: '',
      passwordConfirm: '',
      passwordValid: false,
      passwordInvalid: false,
      passwordConfirmValid: false,
      passwordConfirmInvalid: false,
      registrationMethod: null,
      username: '',
    };
  },
  watch: {
    email () {
      this.validateEmail(this.email);
    },
    password () {
      this.validatePassword(this.password);
    },
    passwordConfirm () {
      this.validatePasswordConfirm(this.passwordConfirm);
    },
  },
  // @TODO: Abstract hello in to action or lib
  mounted () {
    hello.init({
      google: import.meta.env.GOOGLE_CLIENT_ID, // eslint-disable-line
    });
  },
  methods: {
    validateEmail: debounce(function valEmail (email) {
      if (!email) {
        this.emailValid = false;
        this.emailError = null;
        return;
      }
      if (!isEmail(email)) {
        this.emailValid = false;
        this.emailError = this.$t('enterValidEmail');
        return;
      }
      this.$store.dispatch('auth:checkEmail', {
        email,
      }).then(res => {
        if (!res.valid) {
          this.emailValid = false;
          this.emailError = this.$t('cannotFulfillReq');
          return;
        }
        this.emailValid = true;
        this.emailError = null;
      });
    }, 500),
    validatePassword: debounce(function valPass (password) {
      if (!password) {
        this.passwordValid = false;
        this.passwordInvalid = false;
        return;
      }
      this.passwordValid = password.length >= MINIMUM_PASSWORD_LENGTH;
      this.passwordInvalid = password.length < MINIMUM_PASSWORD_LENGTH;
    }, 500),
    validatePasswordConfirm: debounce(function valPassConf (passwordConfirm) {
      if (!passwordConfirm) {
        this.passwordConfirmValid = false;
        this.passwordConfirmInvalid = false;
        return;
      }
      this.passwordConfirmValid = passwordConfirm === this.password;
      this.passwordConfirmInvalid = passwordConfirm !== this.password;
    }, 500),
    async proceed (accountType) {
      if (accountType === 'apple') {
        window.location.href = buildAppleAuthUrl();
      } else {
        window.sessionStorage.removeItem('apple-token');
      }
      if (accountType === 'local') {
        this.$store.state.registrationOptions = {
          email: this.email,
          password: this.password,
          passwordConfirm: this.passwordConfirm,
          registrationMethod: 'local',
        };
      } else {
        this.authData = await this.socialAuth(accountType);
        const authId = await this.$store.dispatch('auth:socialAuth', {
          auth: this.authData,
          allowRegister: false,
        });
        if (authId) {
          window.location.href = '/';
        } else {
          this.$store.state.registrationOptions = {
            authData: this.authData,
            email: window.sessionStorage.getItem('social-email'),
            registrationMethod: accountType,
          };
        }
      }
      this.$router.push({ name: 'username', query: this.$route.query });
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
};
