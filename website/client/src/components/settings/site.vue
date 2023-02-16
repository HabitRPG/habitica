<template>
  <div class="row standard-page">
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
      </div>
    </div>
    <div class="col-sm-6">
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
    width: 100%;
    margin-top: 5px;
  }
</style>

<script>
import hello from 'hellojs';
import axios from 'axios';
import { mapState } from '@/libs/store';
import { SUPPORTED_SOCIAL_NETWORKS } from '@/../../common/script/constants';
import notificationsMixin from '../../mixins/notifications';

export default {
  components: {
  },
  mixins: [notificationsMixin],
  data () {
    return {
      SOCIAL_AUTH_NETWORKS: [],
      party: {},
      // Made available by the server as a script
      localAuth: {
        password: '',
        confirmPassword: '',
      },
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

    const focusID = this.$route.query.focus; // ... what is this needed for?
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


  },
};
</script>
