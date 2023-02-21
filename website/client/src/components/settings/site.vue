<template>
  <div class="row standard-page">
    <h1 class="col-12">
      {{ $t('settings') }} - to be removed once all settings found a new place
    </h1>
    <div class="col-sm-6">
      <div>
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
import { mapState } from '@/libs/store';
import notificationsMixin from '../../mixins/notifications';

export default {
  components: {
  },
  mixins: [notificationsMixin],
  data () {
    return {
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
    // @TODO: We may need to request the party here
    this.party = this.$store.state.party;

    this.$store.dispatch('common:setTitle', {
      section: this.$t('settings'),
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
  },
};
</script>
