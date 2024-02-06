<template>
  <div class="row standard-page px-0">
    <div class="col-12">
      <h1
        v-once
        class="page-header"
      >
        {{ $t('notifications') }}
      </h1>
    </div>
    <div class="col-12">
      <h2 v-once>
        {{ $t('allNotifications') }}
      </h2>

      <table class="table">
        <tr>
          <td class="bold">
            {{ $t('unsubscribeAllPush') }}
          </td>
          <td>
            <toggle-switch
              :checked="user.preferences.pushNotifications.unsubscribeFromAll"
              @change="set('pushNotifications', 'unsubscribeFromAll', $event)"
            />
          </td>
        </tr>
        <tr>
          <td>
            <span class="bold">{{ $t('unsubscribeAllEmails') }}</span> <br>
            <small>{{ $t('unsubscribeAllEmailsText') }}</small>
          </td>
          <td>
            <toggle-switch
              :checked="user.preferences.emailNotifications.unsubscribeFromAll"
              @change="set('emailNotifications', 'unsubscribeFromAll', $event)"
            />
          </td>
        </tr>
        <tr>
          <td></td>
          <td></td>
        </tr>
      </table>
    </div>
    <div class="col-12">
      <h2>Website</h2>
      <table class="table">
        <tr>
          <td
            v-once
            class="bold"
          >
            {{ $t('showLevelUpModal') }}
          </td>
          <td class="email_push_col">
            <toggle-switch
              :checked="!user.preferences.suppressModals.levelUp"
              class="toggle-switch-width"
              @change="set('suppressModals', 'levelUp', !$event)"
            />
          </td>
        </tr>
        <tr>
          <td
            v-once
            class="bold"
          >
            {{ $t('showHatchPetModal') }}
          </td>
          <td class="email_push_col">
            <toggle-switch
              :checked="!user.preferences.suppressModals.hatchPet"
              class="toggle-switch-width"
              @change="set('suppressModals', 'hatchPet', !$event)"
            />
          </td>
        </tr>
        <tr>
          <td
            v-once
            class="bold"
          >
            {{ $t('showRaisePetModal') }}
          </td>
          <td class="email_push_col">
            <toggle-switch
              :checked="!user.preferences.suppressModals.raisePet"
              class="toggle-switch-width"
              @change="set('suppressModals', 'raisePet', !$event)"
            />
          </td>
        </tr>
        <tr>
          <td
            v-once
            class="bold"
          >
            {{ $t('showStreakModal') }}
          </td>
          <td class="email_push_col">
            <toggle-switch
              :checked="!user.preferences.suppressModals.streak"
              class="toggle-switch-width"
              @change="set('suppressModals', 'streak', !$event)"
            />
          </td>
        </tr>
        <tr>
          <td
            v-once
            class="bold"
          >
            {{ $t('baileyAnnouncement') }}
          </td>
          <td class="email_push_col show_bailey_col">
            <b-popover
              target="viewBaileyLink"
              triggers="hover"
              placement="right"
              :content="$t('showBaileyPop')"
            />
            <a
              id="viewBaileyLink"
              class="show_bailey_link"
              @click="showBailey()"
            >
              {{ $t('view') }}
            </a>
          </td>
        </tr>
        <tr>
          <td></td>
          <td></td>
        </tr>
      </table>
    </div>
    <div class="col-12">
      <h2>Email & Push</h2>

      <table class="table">
        <tr>
          <td></td>
          <th class="email_push_col email_col_padding">
            <span v-once>{{ $t('email') }}</span>
          </th>
          <th class="email_push_col">
            <span v-once>{{ $t('push') }}</span>
          </th>
        </tr>
        <tr
          v-for="notification in notificationsIds"
          :key="notification"
        >
          <td
            v-once
            class="bold"
          >
            {{ $t(notification) }}
          </td>
          <td class="email_push_col">
            <toggle-switch
              :checked="user.preferences.emailNotifications[notification]"
              class="toggle-switch-width"
              @change="set('emailNotifications', notification, $event)"
            />
          </td>
          <td class="email_push_col">
            <toggle-switch
              v-if="!onlyEmailsIds.includes(notification)"
              :checked="user.preferences.pushNotifications[notification]"
              class="toggle-switch-width"
              @change="set('pushNotifications', notification, $event)"
            />
          </td>
        </tr>
        <tr>
          <td></td>
          <td></td>
          <td></td>
        </tr>
      </table>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@import '~@/assets/scss/colors.scss';

.toggle-switch-width {
  ::v-deep {
    .toggle-switch {
      margin-left: 0;
    }
  }
}

.email_push_col {
  width: 50px;
  padding-left: 0 !important;
  padding-right: 0 !important;
}

/** Table Styles, maybe can be copied / extracted once more Pages need it */

.table {
  margin-bottom: 0.5rem;
}

.table th, .table td {
  padding: 0.5rem;
}

.bold {
  font-weight: bold;
  line-height: 1.71;
  color: $gray-50;
}

small {
  font-size: 12px;
  line-height: 1.33;
  color: $gray-100;
}

.email_col_padding {
  padding-right: 70px !important;
}

toggle-switch {
  padding-right: 8px;
}

.show_bailey_col {
  text-align: right;
}

.show_bailey_link {
  padding-right: 8px;
  line-height: 1.71;
  // color: $blue-10 !important;

  &:hover {
    text-decoration: underline;
  }
}
</style>

<script>
import { mapState } from '@/libs/store';
import notificationsMixin from '@/mixins/notifications';
import ToggleSwitch from '@/components/ui/toggleSwitch';

export default {
  components: { ToggleSwitch },
  mixins: [notificationsMixin],
  data () {
    return {
      notificationsIds: Object.freeze([
        'majorUpdates',
        'newPM',
        'giftedGems',
        'giftedSubscription',
        'invitedParty',
        'invitedGuild',
        'invitedQuest',
        'questStarted',
        'wonChallenge',
        // 'weeklyRecaps',
        'kickedGroup',
        'onboarding',
        'importantAnnouncements',
        'subscriptionReminders',
        'contentRelease',
      ]),
      // list of email-only notifications
      onlyEmailsIds: Object.freeze([
        'kickedGroup',
        'importantAnnouncements',
        'weeklyRecaps',
        'onboarding',
        'subscriptionReminders',
      ]),
    };
  },
  computed: {
    ...mapState({ user: 'user.data' }),
  },
  async mounted () {
    this.$store.dispatch('common:setTitle', {
      section: this.$t('settings'),
      subSection: this.$t('notifications'),
    });
    // If ?unsubFrom param is passed with valid email type,
    // automatically unsubscribe users from that email and
    // show an alert

    // A simple object to map the key stored in the db (user.preferences.emailNotification[key])
    // to its string id but ONLY when the preferences' key and the string key don't match
    const MAP_PREF_TO_EMAIL_STRING = {
      importantAnnouncements: 'inactivityEmails',
    };

    const { unsubFrom } = this.$route.query;

    if (unsubFrom) {
      await this.$store.dispatch('user:set', {
        [`preferences.emailNotifications.${unsubFrom}`]: false,
      });

      const emailTypeString = this.$t(MAP_PREF_TO_EMAIL_STRING[unsubFrom] || unsubFrom);
      this.text(this.$t('correctlyUnsubscribedEmailType', { emailType: emailTypeString }));
    }
  },
  methods: {
    set (preferenceType, notification, $event) {
      const settings = {};
      settings[`preferences.${preferenceType}.${notification}`] = $event ?? this.user.preferences[preferenceType][notification];
      this.$store.dispatch('user:set', settings);
    },
    showBailey () {
      this.$root.$emit('bv::show::modal', 'new-stuff');
    },
  },
};
</script>
