import isEmail from 'validator/es/lib/isEmail';
import { MINIMUM_PASSWORD_LENGTH } from '@/../../common/script/constants';
import hello from 'hellojs';
import { buildAppleAuthUrl } from '../libs/auth';

export default {
  computed: {
    emailValid () {
      if (this.email.length < 1) return false;
      return isEmail(this.email);
    },
    emailInvalid () {
      if (this.email.length < 1) return false;
      if (!isEmail(this.email)) return true;
      const domain = this.email.split('@')[1];
      return ['habitica.com', 'habitrpg.com'].indexOf(domain) + 1;
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
      return this.passwordConfirm !== this.password;
    },
    signupFormInvalid () {
      return this.emailInvalid
        || this.passwordInvalid
        || this.passwordConfirmInvalid;
    },
  },
  // @TODO: Abstract hello in to action or lib
  mounted () {
    hello.init({
      google: import.meta.env.GOOGLE_CLIENT_ID, // eslint-disable-line
    });
  },
  methods: {
    async proceed (accountType) {
      if (accountType === 'local') {
        const emailCheck = await this.$store.dispatch('auth:checkEmail', {
          email: this.email,
        });
        if (!emailCheck.valid) {
          this.error(this.$t('cannotFulfillReq'));
          throw new Error(this.$t('cannotFulfillReq'));
        }
        this.registrationMethod = 'local';
      } else {
        this.authData = await this.socialAuth(accountType);
        const authResponse = await this.$store.dispatch('auth:socialAuth', {
          auth: this.authData,
          allowRegister: false,
        });
        if (authResponse) {
          window.location.href = '/';
        } else {
          this.email = window.sessionStorage.getItem('social-email');
          this.registrationMethod = accountType;
        }
      }
    },
    async socialAuth (network) {
      if (network === 'apple') {
        window.location.href = buildAppleAuthUrl();
      } else {
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
      }
    },
  },
}