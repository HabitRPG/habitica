<template lang="pug">
  .row.standard-page
    restore-modal
    reset-modal
    delete-modal
    h1.col-12 {{ $t('settings') }}
    .col-sm-6
      .form-horizontal
        h5 {{ $t('language') }}
        select.form-control(:value='user.preferences.language',
          @change='changeLanguage($event)')
          option(v-for='lang in availableLanguages', :value='lang.code') {{lang.name}}

        small
          | {{ $t('americanEnglishGovern') }}
          br
          strong(v-html="$t('helpWithTranslation')")
      hr

      .form-horizontal
        h5 {{ $t('dateFormat') }}
        select.form-control(v-model='user.preferences.dateFormat',
          @change='set("dateFormat")')
          option(v-for='dateFormat in availableFormats', :value='dateFormat') {{dateFormat}}
      hr

      .form-horizontal
        h5 {{ $t('audioTheme') }}
        select.form-control(v-model='user.preferences.sound',
          @change='set("sound")')
          option(v-for='sound in availableAudioThemes', :value='sound') {{ $t(`audioTheme_${sound}`) }}
      hr

      .form-horizontal(v-if='hasClass')
        h5 {{ $t('characterBuild') }}
        h6(v-once) {{ $t('class') + ': ' }}
          // @TODO: what is classText
          // span(v-if='classText') {{ classText }}&nbsp;
          button.btn.btn-danger.btn-xs(@click='changeClassForUser(true)', v-once) {{ $t('changeClass') }}
          small.cost &nbsp; 3 {{ $t('gems') }}
            // @TODO add icon span.Pet_Currency_Gem1x.inline-gems
        hr

      div
        .checkbox
          label
            input(type='checkbox', v-model='user.preferences.advancedCollapsed', @change='set("advancedCollapsed")')
            span.hint(popover-trigger='mouseenter', popover-placement='right', :popover="$t('startAdvCollapsedPop')") {{ $t('startAdvCollapsed') }}
        .checkbox
          label
            input(type='checkbox', v-model='user.preferences.dailyDueDefaultView', @change='set("dailyDueDefaultView")')
            span.hint(popover-trigger='mouseenter', popover-placement='right', :popover="$t('dailyDueDefaultViewPop')") {{ $t('dailyDueDefaultView') }}
        .checkbox(v-if='party.memberCount === 1')
          label
            input(type='checkbox', v-model='user.preferences.displayInviteToPartyWhenPartyIs1', @change='set("displayInviteToPartyWhenPartyIs1")')
            span.hint(popover-trigger='mouseenter', popover-placement='right', :popover="$t('displayInviteToPartyWhenPartyIs1')") {{ $t('displayInviteToPartyWhenPartyIs1') }}
        .checkbox
          input(type='checkbox', v-model='user.preferences.suppressModals.levelUp', @change='set("suppressModals", "levelUp")')
          label {{ $t('suppressLevelUpModal') }}
        .checkbox
          input(type='checkbox', v-model='user.preferences.suppressModals.hatchPet', @change='set("suppressModals", "hatchPet")')
          label {{ $t('suppressHatchPetModal') }}
        .checkbox
          input(type='checkbox', v-model='user.preferences.suppressModals.raisePet', @change='set("suppressModals", "raisePet")')
          label {{ $t('suppressRaisePetModal') }}
        .checkbox
          input(type='checkbox', v-model='user.preferences.suppressModals.streak', @change='set("suppressModals", "streak")')
          label {{ $t('suppressStreakModal') }}
        //- .checkbox
        //-   label {{ $t('confirmScoreNotes') }}
        //-     input(type='checkbox', v-model='user.preferences.tasks.confirmScoreNotes', @change='set({"preferences.tasks.confirmScoreNotes": user.preferences.tasks.confirmScoreNotes ? true: false})')

        //- .checkbox
        //-   label {{ $t('groupTasksByChallenge') }}
        //-     input(type='checkbox', v-model='user.preferences.tasks.groupByChallenge', @change='set({"preferences.tasks.groupByChallenge": user.preferences.tasks.groupByChallenge ? true: false})')

        hr

        button.btn.btn-primary.mr-2.mb-2(@click='showBailey()', popover-trigger='mouseenter', popover-placement='right', :popover="$t('showBaileyPop')") {{ $t('showBailey') }}
        button.btn.btn-primary.mr-2.mb-2(@click='openRestoreModal()', popover-trigger='mouseenter', popover-placement='right', :popover="$t('fixValPop')") {{ $t('fixVal') }}
        button.btn.btn-primary.mb-2(v-if='user.preferences.disableClasses == true', @click='changeClassForUser(false)',
          popover-trigger='mouseenter', popover-placement='right', :popover="$t('enableClassPop')") {{ $t('enableClass') }}

        hr

        div
          h5 {{ $t('customDayStart') }}
          .alert.alert-warning {{ $t('customDayStartInfo1') }}
          .form-horizontal
            .form-group
              .col-7
                select.form-control(v-model='newDayStart')
                  option(v-for='option in dayStartOptions' :value='option.value') {{option.name}}

              .col-5
                button.btn.btn-block.btn-primary.mt-1(@click='openDayStartModal()',
                  :disabled='newDayStart === user.preferences.dayStart')
                  | {{ $t('saveCustomDayStart') }}
          hr

        h5 {{ $t('timezone') }}
        .form-horizontal
          .form-group
            .col-12
              p(v-html="$t('timezoneUTC', {utc: timezoneOffsetToUtc})")
              p(v-html="$t('timezoneInfo')")

    .col-sm-6
      h2 {{ $t('registration') }}
      .panel-body
        div
          ul.list-inline
            li(v-for='network in SOCIAL_AUTH_NETWORKS')
              button.btn.btn-primary.mb-2(v-if='!user.auth[network.key].id', @click='socialAuth(network.key, user)') {{ $t('registerWithSocial', {network: network.name}) }}
              button.btn.btn-primary.mb-2(disabled='disabled', v-if='!hasBackupAuthOption(network.key) && user.auth[network.key].id') {{ $t('registeredWithSocial', {network: network.name}) }}
              button.btn.btn-danger(@click='deleteSocialAuth(network)', v-if='hasBackupAuthOption(network.key) && user.auth[network.key].id') {{ $t('detachSocial', {network: network.name}) }}
          hr
          div(v-if='!user.auth.local.email')
            p {{ $t('addLocalAuth') }}
            .form(name='localAuth', novalidate)
              .form-group
                input.form-control(type='text', :placeholder="$t('email')", v-model='localAuth.email', required)
              .form-group
                input.form-control(type='password', :placeholder="$t('password')", v-model='localAuth.password', required)
              .form-group
                input.form-control(type='password', :placeholder="$t('confirmPass')", v-model='localAuth.confirmPassword', required)
              button.btn.btn-primary(type='submit', @click='addLocalAuth()') {{ $t('submit') }}

        .usersettings
          h5 {{ $t('changeDisplayName') }}
          .form(name='changeDisplayName', novalidate)
            .form-group
              input#changeDisplayname.form-control(type='text', :placeholder="$t('newDisplayName')", v-model='temporaryDisplayName', :class='{"is-invalid input-invalid": displayNameInvalid}')
              .mb-3(v-if="displayNameIssues.length > 0")
                .input-error(v-for="issue in displayNameIssues") {{ issue }}
            button.btn.btn-primary(type='submit', @click='changeDisplayName(temporaryDisplayName)', :disabled='displayNameCannotSubmit') {{ $t('submit') }}

          h5 {{ $t('changeUsername') }}
          .form(name='changeUsername', novalidate)
            .iconalert.iconalert-success(v-if='verifiedUsername') {{ $t('usernameVerifiedConfirmation', {'username': user.auth.local.username}) }}
            .iconalert.iconalert-warning(v-else)
              div.align-middle
                span {{ $t('usernameNotVerified') }}
            .form-group
              input#changeUsername.form-control(@blur='restoreEmptyUsername()',type='text', :placeholder="$t('newUsername')", v-model='usernameUpdates.username', :class='{"is-invalid input-invalid": usernameInvalid}')
              .input-error(v-for="issue in usernameIssues") {{ issue }}
              small.form-text.text-muted {{ $t('changeUsernameDisclaimer') }}
            button.btn.btn-primary(type='submit', @click='changeUser("username", usernameUpdates)', :disabled='usernameCannotSubmit') {{ $t('saveAndConfirm') }}
          h5(v-if='user.auth.local.email') {{ $t('changeEmail') }}
          .form(v-if='user.auth.local.email', name='changeEmail', novalidate)
            .form-group
              input#changeEmail.form-control(type='text', :placeholder="$t('newEmail')", v-model='emailUpdates.newEmail')
            .form-group
              input.form-control(type='password', :placeholder="$t('password')", v-model='emailUpdates.password')
            button.btn.btn-primary(type='submit', @click='changeUser("email", emailUpdates)') {{ $t('submit') }}

          h5(v-if='user.auth.local.email') {{ $t('changePass') }}
          .form(v-if='user.auth.local.email', name='changePassword', novalidate)
            .form-group
              input#changePassword.form-control(type='password', :placeholder="$t('oldPass')", v-model='passwordUpdates.password')
            .form-group
              input.form-control(type='password', :placeholder="$t('newPass')", v-model='passwordUpdates.newPassword')
            .form-group
              input.form-control(type='password', :placeholder="$t('confirmPass')", v-model='passwordUpdates.confirmPassword')
            button.btn.btn-primary(type='submit', @click='changeUser("password", passwordUpdates)') {{ $t('submit')  }}
          hr

        div
          h5 {{ $t('dangerZone') }}
          div
            button.btn.btn-danger.mr-2.mb-2(@click='openResetModal()',
              popover-trigger='mouseenter', popover-placement='right', v-b-popover.hover.auto="$t('resetAccPop')") {{ $t('resetAccount') }}
            button.btn.btn-danger.mb-2(@click='openDeleteModal()',
              popover-trigger='mouseenter', v-b-popover.hover.auto="$t('deleteAccPop')") {{ $t('deleteAccount') }}
</template>

<style lang="scss" scoped>
  @import '~client/assets/scss/colors.scss';

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
import moment from 'moment';
import axios from 'axios';
import { mapState } from 'client/libs/store';
import debounce from 'lodash/debounce';
import restoreModal from './restoreModal';
import resetModal from './resetModal';
import deleteModal from './deleteModal';
import { SUPPORTED_SOCIAL_NETWORKS } from '../../../common/script/constants';
import changeClass from  '../../../common/script/ops/changeClass';
import notificationsMixin from '../../mixins/notifications';
// @TODO: this needs our window.env fix
// import { availableLanguages } from '../../../server/libs/i18n';

export default {
  mixins: [notificationsMixin],
  components: {
    restoreModal,
    resetModal,
    deleteModal,
  },
  data () {
    let dayStartOptions = [];
    for (let number = 0; number < 24; number += 1) {
      let meridian = number < 12 ? 'AM' : 'PM';
      let hour = number % 12;
      let option = {
        value: number,
        name: `${hour ? hour : 12}:00 ${meridian}`,
      };
      dayStartOptions.push(option);
    }

    return {
      SOCIAL_AUTH_NETWORKS: [],
      party: {},
      // Made available by the server as a script
      availableFormats: ['MM/dd/yyyy', 'dd/MM/yyyy', 'yyyy/MM/dd'],
      dayStartOptions,
      newDayStart: 0,
      temporaryDisplayName: '',
      usernameUpdates: {username: ''},
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
  mounted () {
    this.SOCIAL_AUTH_NETWORKS = SUPPORTED_SOCIAL_NETWORKS;
    // @TODO: We may need to request the party here
    this.party = this.$store.state.party;
    this.newDayStart = this.user.preferences.dayStart;
    this.usernameUpdates.username = this.user.auth.local.username || null;
    this.temporaryDisplayName = this.user.profile.name;
    this.emailUpdates.newEmail = this.user.auth.local.email || null;
    this.localAuth.username = this.user.auth.local.username || null;
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
  computed: {
    ...mapState({
      user: 'user.data',
      availableLanguages: 'i18n.availableLanguages',
      content: 'content',
    }),
    availableAudioThemes () {
      return ['off', ...this.content.audioThemes];
    },
    timezoneOffsetToUtc () {
      let offset = this.user.preferences.timezoneOffset;
      let sign = offset > 0 ? '-' : '+';

      offset = Math.abs(offset) / 60;

      let hour = Math.floor(offset);

      let minutesInt = (offset - hour) * 60;
      let minutes = minutesInt < 10 ? `0${minutesInt}` : minutesInt;

      return `UTC${sign}${hour}:${minutes}`;
    },
    dayStart () {
      return this.user.preferences.dayStart;
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
  methods: {
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
      let settings = {};
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

      return find(this.SOCIAL_AUTH_NETWORKS, (network) => {
        if (network.key !== networkKeyToCheck) {
          if (this.user.auth.hasOwnProperty(network.key)) {
            return this.user.auth[network.key].id;
          }
        }
      });
    },
    calculateNextCron () {
      let nextCron = moment().hours(this.newDayStart).minutes(0).seconds(0).milliseconds(0);

      let currentHour = moment().format('H');
      if (currentHour >= this.newDayStart) {
        nextCron = nextCron.add(1, 'day');
      }

      return nextCron.format(`${this.user.preferences.dateFormat.toUpperCase()} @ h:mm a`);
    },
    openDayStartModal () {
      let nextCron = this.calculateNextCron();
      // @TODO: Add generic modal
      if (!confirm(this.$t('sureChangeCustomDayStartTime', {time: nextCron}))) return;
      this.saveDayStart();
      // $rootScope.openModal('change-day-start', { scope: $scope });
    },
    async saveDayStart () {
      this.user.preferences.dayStart = this.newDayStart;
      await axios.post('/api/v4/user/custom-day-start', {
        dayStart: this.newDayStart,
      });
      // @TODO
      // Notification.text(response.data.data.message);
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
        this.user.auth.local.email = updates[attribute];
      }
    },
    async changeDisplayName (newName) {
      await axios.put('/api/v4/user/', {'profile.name': newName});
      alert(this.$t('displayNameSuccess'));
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
      this.text(this.$t('detachedSocial', {network: network.name}));
    },
    async socialAuth (network) {
      let auth = await hello(network).login({scope: 'email'});

      await this.$store.dispatch('auth:socialAuth', {
        auth,
      });

      window.location.href = '/';
    },
    async changeClassForUser (confirmationNeeded) {
      if (confirmationNeeded && !confirm(this.$t('changeClassConfirmCost'))) return;
      try {
        changeClass(this.user);
        await axios.post('/api/v4/user/change-class');
      } catch (e) {
        alert(e.message);
      }
    },
    async addLocalAuth () {
      await axios.post('/api/v4/user/auth/local/register', this.localAuth);
      alert(this.$t('addedLocalAuth'));
    },
    restoreEmptyUsername () {
      if (this.usernameUpdates.username.length < 1) {
        this.usernameUpdates.username = this.user.auth.local.username;
      }
    },
  },
};
</script>
