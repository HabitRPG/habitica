<template>
  <fragment>
    <tr
      v-for="network in SOCIAL_AUTH_NETWORKS"
      :key="network.key"
    >
      <td class="settings-label">
        <div class="network-icon-with-label">
          <span
            :class="'svg-icon icon-16 social-icon ' + network.key"
            v-html="icons[network.key]"
          ></span>

          <span class="ml-75"> {{ network.name }}</span>
        </div>
      </td>
      <td class="settings-value">
        <div
          v-if="isConnected(network.key)"
          class="connected-pill"
        >
          {{ $t('connected') }}
        </div>
      </td>
      <td class="settings-button">
        <a
          v-if="allowedToConnect(network.key)"
          class="edit-link"
          @click.prevent="socialAuth(network.key, user)"
        >
          {{ $t('connect') }}
        </a>
        <a
          v-if="allowedToRemove(network.key)"
          class="remove-link"
          @click.prevent="deleteSocialAuth(network)"
        >
          {{ $t('remove') }}
        </a>
      </td>
    </tr>
  </fragment>
</template>

<script>
import axios from 'axios';
import hello from 'hellojs';
import { SUPPORTED_SOCIAL_NETWORKS } from '@/../../common/script/constants';
import { buildAppleAuthUrl } from '@/libs/auth';
import { mapState } from '@/libs/store';
import googleIcon from '@/assets/svg/google.svg';
import appleIcon from '@/assets/svg/apple_black.svg';

export default {
  name: 'LoginMethods',
  data () {
    return {
      SOCIAL_AUTH_NETWORKS: [],
      // Made available by the server as a script
      localAuth: {
        password: '',
        confirmPassword: '',
      },
      icons: Object.freeze({
        google: googleIcon,
        apple: appleIcon,
      }),
    };
  },
  computed: {
    ...mapState({
      user: 'user.data',
      content: 'content',
    }),
  },
  mounted () {
    this.SOCIAL_AUTH_NETWORKS = SUPPORTED_SOCIAL_NETWORKS;

    this.$store.dispatch('common:setTitle', {
      section: this.$t('settings'),
    });

    hello.init({
      google: process.env.GOOGLE_CLIENT_ID, // eslint-disable-line no-process-env
    }, {
      redirect_uri: '', // eslint-disable-line
    });

    const focusID = this.$route.query.focus;
    if (focusID !== undefined && focusID !== null) {
      this.$nextTick(() => {
        const element = document.getElementById(focusID);
        if (element !== undefined && element !== null) {
          element.focus();
        }
      });
    }
  },
  methods: {
    async deleteSocialAuth (network) {
      await axios.delete(`/api/v4/user/auth/social/${network.key}`);
      this.user.auth[network.key] = {};
      this.text(this.$t('detachedSocial', { network: network.name }));
    },
    async socialAuth (network) {
      if (network === 'apple') {
        window.location.href = buildAppleAuthUrl();
      } else {
        const auth = await hello(network).login({ scope: 'email' });
        await this.$store.dispatch('auth:socialAuth', {
          auth,
        });
        window.location.href = '/';
      }
    },
    hasBackupAuthOption (networkKeyToCheck) {
      if (this.user.auth.local.username && this.user.auth.local.has_password) {
        return true;
      }

      return this.SOCIAL_AUTH_NETWORKS.find(network => {
        if (network.key !== networkKeyToCheck) {
          if (this.user.auth[network.key]) {
            return !!this.user.auth[network.key].id;
          }
        }

        return false;
      });
    },
    isConnected (networkKeyToCheck) {
      return !!this.user.auth[networkKeyToCheck].id;
    },
    allowedToConnect (networkKeyToCheck) {
      if (networkKeyToCheck === 'facebook') {
        return false; // is still needed? the list of networks doesn't have facebook
      }

      const isConnected = this.isConnected(networkKeyToCheck);

      return !isConnected;
    },
    allowedToRemove (networkKeyToCheck) {
      const isConnected = this.isConnected(networkKeyToCheck);

      return isConnected && this.hasBackupAuthOption(networkKeyToCheck);
    },
  },
};
</script>

<style lang="scss" scoped>
@import '~@/assets/scss/colors.scss';

.icon-16 ::v-deep svg {
  height: 16px;
  width: 16px;
}

.network-icon-with-label {
  display: flex;
  align-items: center;
  flex-direction: row;

  span:not(.svg-icon) {
    flex: 1;
  }
}

.connected-pill {
  display: inline-block;

  padding: 4px 12px;
  border-radius: 100px;
  background-color: $green-50;

  font-size: 12px;
  line-height: 1.33;
  color: $white;
}

.social-icon.apple {
  margin-bottom: -2px !important;
}
</style>
