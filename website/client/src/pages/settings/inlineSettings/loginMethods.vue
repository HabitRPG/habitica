<template>
  <fragment>
    <tr
      v-for="network in SOCIAL_AUTH_NETWORKS"
      :key="network.key"
    >
      <td class="settings-label">
        <div class="network-icon-with-label">
          <span
            class="svg-icon icon-16 social-icon"
            v-html="icons[network.key]"
          ></span>

          <span class="ml-75">        {{ network.name }}</span>
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

    <tr>
      <td colspan="3">
        <h2>Keeping the old UI to debug</h2>
        <div class="panel-body">
          <div>
            <ul class="list-inline">
              <li
                v-for="network in SOCIAL_AUTH_NETWORKS"
                :key="network.key"
              >
                <button
                  v-if="!user.auth[network.key].id && network.key !== 'facebook'"
                  class="btn btn-primary mb-2"
                  @click="socialAuth(network.key, user)"
                >
                  {{ $t('registerWithSocial', { network: network.name }) }}
                </button>
                <button
                  v-if="!hasBackupAuthOption(network.key) && user.auth[network.key].id"
                  class="btn btn-primary mb-2"
                  disabled="disabled"
                >
                  {{ $t('registeredWithSocial', { network: network.name }) }}
                </button>
                <button
                  v-if="hasBackupAuthOption(network.key) && user.auth[network.key].id"
                  class="btn btn-danger"
                  @click="deleteSocialAuth(network)"
                >
                  {{ $t('detachSocial', { network: network.name }) }}
                </button>

                IsConnected: {{ isConnected(network.key) }}
                - Allowed to Connect: {{ allowedToConnect(network.key) }}
                - Allowed to remove {{ allowedToRemove(network.key) }}
              </li>
            </ul>
            <hr>
            TODO Add Local Auth <br>
            Hidden if the user has a password <br>
            <!-- v-if="!user.auth.local.has_password"-->
            <div>
              <h5 v-if="!user.auth.local.email">
                {{ $t('addLocalAuth') }}
              </h5>
              <h5 v-if="user.auth.local.email">
                {{ $t('addPasswordAuth') }}
              </h5>
              <div
                class="form"
                name="localAuth"
                novalidate="novalidate"
              >
                <div
                  v-if="!user.auth.local.email"
                  class="form-group"
                >
                  <input
                    v-model="localAuth.email"
                    class="form-control"
                    type="text"
                    :placeholder="$t('email')"
                    required="required"
                  >
                </div>
                <div class="form-group">
                  <input
                    v-model="localAuth.password"
                    class="form-control"
                    type="password"
                    :placeholder="$t('password')"
                    required="required"
                  >
                </div>
                <div class="form-group">
                  <input
                    v-model="localAuth.confirmPassword"
                    class="form-control"
                    type="password"
                    :placeholder="$t('confirmPass')"
                    required="required"
                  >
                </div>
                <button
                  class="btn btn-primary"
                  type="submit"
                  @click="addLocalAuth()"
                >
                  {{ $t('submit') }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </td>
    </tr>
  </fragment>
</template>

<script>
import axios from 'axios';
import hello from 'hellojs';
import { buildAppleAuthUrl } from '@/libs/auth';
import { mapState } from '@/libs/store';
import { SUPPORTED_SOCIAL_NETWORKS } from '../../../../../common/script/constants';
import googleIcon from '@/assets/svg/google.svg';
import appleIcon from '@/assets/svg/apple_black.svg';

export default {
  name: 'LoginMethods',
  data () {
    return {
      SOCIAL_AUTH_NETWORKS: [],
      party: {},
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

    console.info(this.SOCIAL_AUTH_NETWORKS);

    // @TODO: We may need to request the party here
    this.party = this.$store.state.party;
    this.soundIndex = 0;

    this.$store.dispatch('common:setTitle', {
      section: this.$t('settings'),
    });

    hello.init({
      facebook: process.env.FACEBOOK_KEY, // eslint-disable-line no-process-env
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
    async addLocalAuth () {
      if (this.localAuth.email === '') {
        this.localAuth.email = this.user.auth.local.email;
      }
      await axios.post('/api/v4/user/auth/local/register', this.localAuth);
      window.location.href = '/user/settings/site';
    },
    hasBackupAuthOption (networkKeyToCheck) {
      if (this.user.auth.local.username) {
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

      if (isConnected) {
        return false;
      }
      return true;
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
</style>
