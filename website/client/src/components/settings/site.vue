<template>
  <div class="row standard-page">
    <restore-modal />
    <reset-modal />
    <delete-modal />
    <h1 class="col-12">
      {{ $t('settings') }}
    </h1>
    <div class="col-sm-6">
      <div>
        <div class="checkbox">
          <label>
            <input
              v-model="user.preferences.advancedCollapsed"
              type="checkbox"
              class="mr-2"
              @change="set('advancedCollapsed')"
            >
            <span
              class="hint"
              popover-trigger="mouseenter"
              popover-placement="right"
              :popover="$t('startAdvCollapsedPop')"
            >{{ $t('startAdvCollapsed') }}</span>
          </label>
        </div>
        <div class="checkbox">
          <label>
            <input
              v-model="user.preferences.dailyDueDefaultView"
              type="checkbox"
              class="mr-2"
              @change="set('dailyDueDefaultView')"
            >
            <span
              class="hint"
              popover-trigger="mouseenter"
              popover-placement="right"
              :popover="$t('dailyDueDefaultViewPop')"
            >{{ $t('dailyDueDefaultView') }}</span>
          </label>
        </div>
        <div
          v-if="party.memberCount === 1"
          class="checkbox"
        >
          <label>
            <input
              v-model="user.preferences.displayInviteToPartyWhenPartyIs1"
              type="checkbox"
              class="mr-2"
              @change="set('displayInviteToPartyWhenPartyIs1')"
            >
            <span
              class="hint"
              popover-trigger="mouseenter"
              popover-placement="right"
              :popover="$t('displayInviteToPartyWhenPartyIs1')"
            >{{ $t('displayInviteToPartyWhenPartyIs1') }}</span>
          </label>
        </div>

        <button
          class="btn btn-primary mr-2 mb-2"
          popover-trigger="mouseenter"
          popover-placement="right"
          :popover="$t('fixValPop')"
          @click="openRestoreModal()"
        >
          {{ $t('fixVal') }}
        </button>
      </div>
    </div>
    <div class="col-sm-6">
      <h2>{{ $t('registration') }}</h2>
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
                {{ $t('registerWithSocial', {network: network.name}) }}
              </button>
              <button
                v-if="!hasBackupAuthOption(network.key) && user.auth[network.key].id"
                class="btn btn-primary mb-2"
                disabled="disabled"
              >
                {{ $t('registeredWithSocial', {network: network.name}) }}
              </button>
              <button
                v-if="hasBackupAuthOption(network.key) && user.auth[network.key].id"
                class="btn btn-danger"
                @click="deleteSocialAuth(network)"
              >
                {{ $t('detachSocial', {network: network.name}) }}
              </button>
            </li>
          </ul>
          <hr>
          <div v-if="!user.auth.local.has_password">
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
        <div class="usersettings">
          <h5 v-if="user.auth.local.has_password">
            {{ $t('changePass') }}
          </h5>
          <div
            v-if="user.auth.local.has_password"
            class="form"
            name="changePassword"
            novalidate="novalidate"
          >
            <div class="form-group">
              <input
                id="changePassword"
                v-model="passwordUpdates.password"
                class="form-control"
                type="password"
                :placeholder="$t('oldPass')"
              >
            </div>
            <div class="form-group">
              <input
                v-model="passwordUpdates.newPassword"
                class="form-control"
                type="password"
                :placeholder="$t('newPass')"
              >
            </div>
            <div class="form-group">
              <input
                v-model="passwordUpdates.confirmPassword"
                class="form-control"
                type="password"
                :placeholder="$t('confirmPass')"
              >
            </div>
            <button
              class="btn btn-primary"
              type="submit"
              @click="changeUser('password', passwordUpdates)"
            >
              {{ $t('submit') }}
            </button>
          </div>
          <hr>
        </div>
        <div>
          <h5>{{ $t('dangerZone') }}</h5>
          <div>
            <button
              v-b-popover.hover.auto="$t('resetAccPop')"
              class="btn btn-danger mr-2 mb-2"
              popover-trigger="mouseenter"
              popover-placement="right"
              @click="openResetModal()"
            >
              {{ $t('resetAccount') }}
            </button>
            <button
              v-b-popover.hover.auto="$t('deleteAccPop')"
              class="btn btn-danger mb-2"
              popover-trigger="mouseenter"
              @click="openDeleteModal()"
            >
              {{ $t('deleteAccount') }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
  @import '~@/assets/scss/colors.scss';
  input {
    color: $gray-50;
  }
  .usersettings h5 {
    margin-top: 1em;
  }
  .iconalert > div > span {
    line-height: 25px;
  }
  .iconalert > div:after {
    clear: both;
    content: '';
    display: table;
  }
  .input-error {
    color: $red-50;
    font-size: 90%;
    width: 100%;
    margin-top: 5px;
  }
</style>

<script>
import hello from 'hellojs';
import axios from 'axios';
import { mapState } from '@/libs/store';
import restoreModal from './restoreModal';
import resetModal from './resetModal';
import deleteModal from './deleteModal';
import { SUPPORTED_SOCIAL_NETWORKS } from '@/../../common/script/constants';
import notificationsMixin from '../../mixins/notifications';
import sounds from '../../libs/sounds';
import { buildAppleAuthUrl } from '../../libs/auth';

export default {
  components: {
    restoreModal,
    resetModal,
    deleteModal,
  },
  mixins: [notificationsMixin],
  data () {
    return {
      SOCIAL_AUTH_NETWORKS: [],
      party: {},
      // Made available by the server as a script
      availableFormats: ['MM/dd/yyyy', 'dd/MM/yyyy', 'yyyy/MM/dd'],
      passwordUpdates: {},
      localAuth: {
        password: '',
        confirmPassword: '',
      },
    };
  },
  computed: {
    ...mapState({
      user: 'user.data',
      availableLanguages: 'i18n.availableLanguages',
      content: 'content',
    }),
    availableAudioThemes () {
      return ['off', ...this.content.audioThemes];
    },
    hasClass () {
      return this.$store.getters['members:hasClass'](this.user);
    },
  },
  mounted () {
    this.SOCIAL_AUTH_NETWORKS = SUPPORTED_SOCIAL_NETWORKS;
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
    set (preferenceType, subtype) {
      const settings = {};
      if (!subtype) {
        settings[`preferences.${preferenceType}`] = this.user.preferences[preferenceType];
      } else {
        settings[`preferences.${preferenceType}.${subtype}`] = this.user.preferences[preferenceType][subtype];
      }
      return this.$store.dispatch('user:set', settings);
    },
    hideHeader () {
      this.set('hideHeader');
      if (!this.user.preferences.hideHeader || !this.user.preferences.stickyHeader) return;
      this.user.preferences.hideHeader = false;
      this.set('stickyHeader');
    },
    toggleStickyHeader () {
      this.set('stickyHeader');
    },
    showTour  () {
      // @TODO: Do we still use this?
      // User.set({'flags.showTour':true});
      // Guide.goto('intro', 0, true);
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
    async changeUser (attribute, updates) {
      await axios.put(`/api/v4/user/auth/update-${attribute}`, updates);
      if (attribute === 'password') {
        this.passwordUpdates = {};
        this.$store.dispatch('snackbars:add', {
          title: 'Habitica',
          text: this.$t('passwordSuccess'),
          type: 'success',
          timeout: true,
        });
      }
    },
    openRestoreModal () {
      this.$root.$emit('bv::show::modal', 'restore');
    },
    openResetModal () {
      this.$root.$emit('bv::show::modal', 'reset');
    },
    openDeleteModal () {
      this.$root.$emit('bv::show::modal', 'delete');
    },
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
    changeAudioTheme () {
      this.soundIndex = 0;
      this.set('sound');
    },
    playAudio () {
      this.$root.$emit('playSound', sounds[this.soundIndex]);
      this.soundIndex = (this.soundIndex + 1) % sounds.length;
    },
  },
};
</script>
