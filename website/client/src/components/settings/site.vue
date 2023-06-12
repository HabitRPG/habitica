<template>
  <div class="row standard-page">
    <restore-modal />
    <reset-modal />
    <delete-modal />
    <h1 class="col-12">
      {{ $t('settings') }}
    </h1>
    <div class="col-sm-6">
      <div class="sleep">
        <h5>{{ $t('pauseDailies') }}</h5>
        <h4>{{ $t('sleepDescription') }}</h4>
        <ul>
          <li v-once>
            {{ $t('sleepBullet1') }}
          </li>
          <li v-once>
            {{ $t('sleepBullet2') }}
          </li>
          <li v-once>
            {{ $t('sleepBullet3') }}
          </li>
        </ul>
        <button
          v-if="!user.preferences.sleep"
          v-once
          class="sleep btn btn-primary btn-block pause-button"
          @click="toggleSleep()"
        >
          {{ $t('pauseDailies') }}
        </button>
        <button
          v-if="user.preferences.sleep"
          v-once
          class="btn btn-secondary btn-block pause-button"
          @click="toggleSleep()"
        >
          {{ $t('unpauseDailies') }}
        </button>
      </div>
      <hr>
      <div class="form-horizontal">
        <h5>{{ $t('language') }}</h5>
        <select
          class="form-control"
          :value="user.preferences.language"
          @change="changeLanguage($event)"
        >
          <option
            v-for="lang in availableLanguages"
            :key="lang.code"
            :value="lang.code"
          >
            {{ lang.name }}
          </option>
        </select>
        <small>
          {{ $t('americanEnglishGovern') }}
          <br>
          <strong v-html="$t('helpWithTranslation')"></strong>
        </small>
      </div>
      <hr>
      <div class="form-horizontal">
        <h5>{{ $t('dateFormat') }}</h5>
        <select
          v-model="user.preferences.dateFormat"
          class="form-control"
          @change="set('dateFormat')"
        >
          <option
            v-for="dateFormat in availableFormats"
            :key="dateFormat"
            :value="dateFormat"
          >
            {{ dateFormat }}
          </option>
        </select>
      </div>
      <hr>
      <div class="form-horizontal">
        <div class="form-group">
          <h5>{{ $t('audioTheme') }}</h5>
          <select
            v-model="user.preferences.sound"
            class="form-control"
            @change="changeAudioTheme"
          >
            <option
              v-for="sound in availableAudioThemes"
              :key="sound"
              :value="sound"
            >
              {{ $t(`audioTheme_${sound}`) }}
            </option>
          </select>
        </div>
        <button
          v-once
          class="btn btn-primary btn-xs"
          @click="playAudio"
        >
          {{ $t('demo') }}
        </button>
      </div>
      <hr>
      <div
        v-if="hasClass"
        class="form-horizontal"
      >
        <h5>{{ $t('characterBuild') }}</h5>
        <h6 v-once>
          {{ $t('class') + ': ' }}
          <!-- @TODO: what is classText-->
          <!-- span(v-if='classText') {{ classText }}&nbsp;-->
          <button
            v-once
            class="btn btn-danger btn-xs"
            @click="changeClassForUser(true)"
          >
            {{ $t('changeClass') }}
          </button>
          <small class="cost">
            &nbsp; 3 {{ $t('gems') }}
            <!-- @TODO add icon span.Pet_Currency_Gem1x.inline-gems-->
          </small>
        </h6>
        <hr>
      </div>
      <div>
        <div
          class="checkbox"
          id="preferenceAdvancedCollapsed"
        >
          <label>
            <input
              v-model="user.preferences.advancedCollapsed"
              type="checkbox"
              class="mr-2"
              @change="set('advancedCollapsed')"
            >
            <span class="hint">
              {{ $t('startAdvCollapsed') }}
            </span>
            <b-popover
              target="preferenceAdvancedCollapsed"
              triggers="hover focus"
              placement="right"
              :prevent-overflow="false"
              :content="$t('startAdvCollapsedPop')"
            />
          </label>
        </div>
        <div
          v-if="party.memberCount === 1"
          class="checkbox"
          id="preferenceDisplayInviteAtOneMember"
        >
          <label>
            <input
              v-model="user.preferences.displayInviteToPartyWhenPartyIs1"
              type="checkbox"
              class="mr-2"
              @change="set('displayInviteToPartyWhenPartyIs1')"
            >
            <span class="hint">
              {{ $t('displayInviteToPartyWhenPartyIs1') }}
            </span>
          </label>
        </div>
        <div class="checkbox">
          <input
            v-model="user.preferences.suppressModals.levelUp"
            type="checkbox"
            class="mr-2"
            @change="set('suppressModals', 'levelUp')"
          >
          <label>{{ $t('suppressLevelUpModal') }}</label>
        </div>
        <div class="checkbox">
          <input
            v-model="user.preferences.suppressModals.hatchPet"
            type="checkbox"
            class="mr-2"
            @change="set('suppressModals', 'hatchPet')"
          >
          <label>{{ $t('suppressHatchPetModal') }}</label>
        </div>
        <div class="checkbox">
          <input
            v-model="user.preferences.suppressModals.raisePet"
            type="checkbox"
            class="mr-2"
            @change="set('suppressModals', 'raisePet')"
          >
          <label>{{ $t('suppressRaisePetModal') }}</label>
        </div>
        <div class="checkbox">
          <input
            v-model="user.preferences.suppressModals.streak"
            type="checkbox"
            class="mr-2"
            @change="set('suppressModals', 'streak')"
          >
          <label>{{ $t('suppressStreakModal') }}</label>
        </div>
        <hr>
        <button
          id="buttonShowBailey"
          class="btn btn-primary mr-2 mb-2"
          @click="showBailey()"
        >
          {{ $t('showBailey') }}
          <b-popover
            target="buttonShowBailey"
            triggers="hover focus"
            placement="right"
            :prevent-overflow="false"
            :content="$t('showBaileyPop')"
          />
        </button>
        <button
          id="buttonFCV"
          class="btn btn-primary mr-2 mb-2"
          @click="openRestoreModal()"
        >
          {{ $t('fixVal') }}
          <b-popover
            target="buttonFCV"
            triggers="hover focus"
            placement="right"
            :prevent-overflow="false"
            :content="$t('fixValPop')"
          />
        </button>
        <button
          v-if="user.preferences.disableClasses == true"
          id="buttonEnableClasses"
          class="btn btn-primary mb-2"
          @click="changeClassForUser(false)"
        >
          {{ $t('enableClass') }}
          <b-popover
            target="buttonEnableClasses"
            triggers="hover focus"
            placement="right"
            :prevent-overflow="false"
            :content="$t('enableClassPop')"
          />
        </button>
        <hr>
        <day-start-adjustment />
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
          <h5>{{ $t('changeDisplayName') }}</h5>
          <div
            class="form"
            name="changeDisplayName"
            novalidate="novalidate"
          >
            <div class="form-group">
              <input
                id="changeDisplayname"
                v-model="temporaryDisplayName"
                class="form-control"
                type="text"
                :placeholder="$t('newDisplayName')"
                :class="{'is-invalid input-invalid': displayNameInvalid}"
              >
              <div
                v-if="displayNameIssues.length > 0"
                class="mb-3"
              >
                <div
                  v-for="issue in displayNameIssues"
                  :key="issue"
                  class="input-error"
                >
                  {{ issue }}
                </div>
              </div>
            </div>
            <button
              class="btn btn-primary"
              type="submit"
              :disabled="displayNameCannotSubmit"
              @click="changeDisplayName(temporaryDisplayName)"
            >
              {{ $t('submit') }}
            </button>
          </div>
          <h5>{{ $t('changeUsername') }}</h5>
          <div
            class="form"
            name="changeUsername"
            novalidate="novalidate"
          >
            <div
              v-if="verifiedUsername"
              class="iconalert iconalert-success"
            >
              {{ $t('usernameVerifiedConfirmation', {'username': user.auth.local.username}) }}
            </div>
            <div
              v-else
              class="iconalert iconalert-warning"
            >
              <div class="align-middle">
                <span>{{ $t('usernameNotVerified') }}</span>
              </div>
            </div>
            <div class="form-group">
              <input
                id="changeUsername"
                v-model="usernameUpdates.username"
                class="form-control"
                type="text"
                :placeholder="$t('newUsername')"
                :class="{'is-invalid input-invalid': usernameInvalid}"
                @blur="restoreEmptyUsername()"
              >
              <div
                v-for="issue in usernameIssues"
                :key="issue"
                class="input-error"
              >
                {{ issue }}
              </div>
              <small class="form-text text-muted">{{ $t('changeUsernameDisclaimer') }}</small>
            </div>
            <button
              class="btn btn-primary"
              type="submit"
              :disabled="usernameCannotSubmit"
              @click="changeUser('username', usernameUpdates)"
            >
              {{ $t('saveAndConfirm') }}
            </button>
          </div>
          <h5 v-if="user.auth.local.has_password">
            {{ $t('changeEmail') }}
          </h5>
          <div
            v-if="user.auth.local.email"
            class="form"
            name="changeEmail"
            novalidate="novalidate"
          >
            <div class="form-group">
              <input
                id="changeEmail"
                v-model="emailUpdates.newEmail"
                class="form-control"
                type="text"
                :placeholder="$t('newEmail')"
              >
            </div>
            <div
              v-if="user.auth.local.has_password"
              class="form-group"
            >
              <input
                v-model="emailUpdates.password"
                class="form-control"
                type="password"
                :placeholder="$t('password')"
              >
            </div>
            <button
              class="btn btn-primary"
              type="submit"
              @click="changeUser('email', emailUpdates)"
            >
              {{ $t('submit') }}
            </button>
          </div>
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

  .checkbox {
    width: fit-content;
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

  .sleep {
    margin-bottom: 16px;
  }
</style>

<script>
import hello from 'hellojs';
import axios from 'axios';
import debounce from 'lodash/debounce';
import { mapState } from '@/libs/store';
import restoreModal from './restoreModal';
import resetModal from './resetModal';
import deleteModal from './deleteModal';
import dayStartAdjustment from './dayStartAdjustment';
import { SUPPORTED_SOCIAL_NETWORKS } from '@/../../common/script/constants';
import changeClass from '@/../../common/script/ops/changeClass';
import notificationsMixin from '../../mixins/notifications';
import sounds from '../../libs/sounds';
import { buildAppleAuthUrl } from '../../libs/auth';

// @TODO: this needs our window.env fix
// import { availableLanguages } from '../../../server/libs/i18n';

export default {
  components: {
    restoreModal,
    resetModal,
    deleteModal,
    dayStartAdjustment,
  },
  mixins: [notificationsMixin],
  data () {
    return {
      SOCIAL_AUTH_NETWORKS: [],
      party: {},
      // Made available by the server as a script
      availableFormats: ['MM/dd/yyyy', 'dd/MM/yyyy', 'yyyy/MM/dd'],
      temporaryDisplayName: '',
      usernameUpdates: { username: '' },
      emailUpdates: {},
      passwordUpdates: {},
      localAuth: {
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
      },
      displayNameIssues: [],
      usernameIssues: [],
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
    verifiedUsername () {
      return this.user.flags.verifiedUsername;
    },
    displayNameInvalid () {
      if (this.temporaryDisplayName.length <= 1) return false;
      return !this.displayNameValid;
    },
    displayNameValid () {
      if (this.temporaryDisplayName.length <= 1) return false;
      return this.displayNameIssues.length === 0;
    },
    displayNameCannotSubmit () {
      if (this.temporaryDisplayName.length <= 1) return true;
      return !this.displayNameValid;
    },
    usernameValid () {
      if (this.usernameUpdates.username.length <= 1) return false;
      return this.usernameIssues.length === 0;
    },
    usernameInvalid () {
      if (this.usernameUpdates.username.length <= 1) return false;
      return !this.usernameValid;
    },
    usernameCannotSubmit () {
      if (this.usernameUpdates.username.length <= 1) return true;
      return !this.usernameValid;
    },
  },
  watch: {
    usernameUpdates: {
      handler () {
        this.validateUsername(this.usernameUpdates.username);
      },
      deep: true,
    },
    temporaryDisplayName: {
      handler () {
        this.validateDisplayName(this.temporaryDisplayName);
      },
      deep: true,
    },
  },
  mounted () {
    this.SOCIAL_AUTH_NETWORKS = SUPPORTED_SOCIAL_NETWORKS;
    // @TODO: We may need to request the party here
    this.party = this.$store.state.party;
    this.usernameUpdates.username = this.user.auth.local.username || null;
    this.temporaryDisplayName = this.user.profile.name;
    this.emailUpdates.newEmail = this.user.auth.local.email || null;
    this.localAuth.username = this.user.auth.local.username || null;
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
    toggleSleep () {
      this.$store.dispatch('user:sleep');
    },
    validateDisplayName: debounce(function checkName (displayName) {
      if (displayName.length <= 1 || displayName === this.user.profile.name) {
        this.displayNameIssues = [];
        return;
      }
      this.$store.dispatch('auth:verifyDisplayName', {
        displayName,
      }).then(res => {
        if (res.issues !== undefined) {
          this.displayNameIssues = res.issues;
        } else {
          this.displayNameIssues = [];
        }
      });
    }, 500),
    validateUsername: debounce(function checkName (username) {
      if (username.length <= 1 || username === this.user.auth.local.username) {
        this.usernameIssues = [];
        return;
      }
      this.$store.dispatch('auth:verifyUsername', {
        username,
      }).then(res => {
        if (res.issues !== undefined) {
          this.usernameIssues = res.issues;
        } else {
          this.usernameIssues = [];
        }
      });
    }, 500),
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
    showBailey () {
      this.$root.$emit('bv::show::modal', 'new-stuff');
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
    async changeLanguage (e) {
      const newLang = e.target.value;
      this.user.preferences.language = newLang;
      await this.set('language');
      setTimeout(() => window.location.reload(true));
    },
    async changeUser (attribute, updates) {
      await axios.put(`/api/v4/user/auth/update-${attribute}`, updates);
      if (attribute === 'username') {
        this.user.auth.local.username = updates[attribute];
        this.localAuth.username = this.user.auth.local.username;
        this.user.flags.verifiedUsername = true;
      } else if (attribute === 'email') {
        this.user.auth.local.email = updates.newEmail;
        window.alert(this.$t('emailSuccess')); // eslint-disable-line no-alert
      } else if (attribute === 'password') {
        this.passwordUpdates = {};
        this.$store.dispatch('snackbars:add', {
          title: 'Habitica',
          text: this.$t('passwordSuccess'),
          type: 'success',
          timeout: true,
        });
      }
    },
    async changeDisplayName (newName) {
      await axios.put('/api/v4/user/', { 'profile.name': newName });
      window.alert(this.$t('displayNameSuccess')); // eslint-disable-line no-alert
      this.user.profile.name = newName;
      this.temporaryDisplayName = newName;
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
    async changeClassForUser (confirmationNeeded) {
      if (confirmationNeeded && !window.confirm(this.$t('changeClassConfirmCost'))) return; // eslint-disable-line no-alert
      try {
        changeClass(this.user);
        await axios.post('/api/v4/user/change-class');
      } catch (e) {
        window.alert(e.message); // eslint-disable-line no-alert
      }
    },
    async addLocalAuth () {
      if (this.localAuth.email === '') {
        this.localAuth.email = this.user.auth.local.email;
      }
      await axios.post('/api/v4/user/auth/local/register', this.localAuth);
      window.location.href = '/user/settings/site';
    },
    restoreEmptyUsername () {
      if (this.usernameUpdates.username.length < 1) {
        this.usernameUpdates.username = this.user.auth.local.username;
      }
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
