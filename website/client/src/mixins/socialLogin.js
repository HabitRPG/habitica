import hello from 'hellojs';
import { buildAppleAuthUrl } from '../libs/auth';

export default {
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