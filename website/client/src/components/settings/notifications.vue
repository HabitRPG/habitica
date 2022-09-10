<template>
  <div class="row standard-page">
    <div class="col-12">
      <h1 class="page-header">{{ $t('notifications') }}</h1>
    </div>
    <div class="col-12">
      <h2>All Notifications</h2>

      <table class="table">
        <tr>
          <td>{{ $t('unsubscribeAllPush') }}</td>
          <td>
            <toggle-switch :checked="user.preferences.pushNotifications.unsubscribeFromAll"
                           @toggle="set('pushNotifications', 'unsubscribeFromAll')"
            />

          </td>
        </tr>
        <tr>
          <td>
            {{ $t('unsubscribeAllEmails') }} <br>
           <small>{{ $t('unsubscribeAllEmailsText') }}</small>
          </td>
          <td>
            <toggle-switch :checked="user.preferences.emailNotifications.unsubscribeFromAll"
                           @toggle="set('emailNotifications', 'unsubscribeFromAll')"
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
      <h2>Email & Push</h2>

      <table class="table">
        <tr>
          <td></td>
          <th class="email_push_col">
            <span>{{ $t('email') }}</span>
          </th>
          <th class="email_push_col">
            <span>{{ $t('push') }}</span>
          </th>
        </tr>
        <tr
            v-for="notification in notificationsIds"
            :key="notification"
        >
          <td>
            <span>{{ $t(notification) }}</span>
          </td>
          <td class="email_push_col">
             <toggle-switch :checked="user.preferences.emailNotifications[notification]"
                           @toggle="set('emailNotifications', notification)"
                            class="toggle-switch-width"
            />
          </td>
          <td class="email_push_col">
              <toggle-switch :checked="user.preferences.pushNotifications[notification]"
                           @toggle="set('pushNotifications', notification)"
                             v-if="!onlyEmailsIds.includes(notification)"
                            class="toggle-switch-width"
            />
          </td>
        </tr>
      </table>
    </div>
  </div>
</template>

<style type="text/scss">
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
        'wonChallenge',
        'questStarted',
        // 'weeklyRecaps',
        'kickedGroup',
        'onboarding',
        'importantAnnouncements',
        'subscriptionReminders',
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
    set (preferenceType, notification) {
      const settings = {};
      settings[`preferences.${preferenceType}.${notification}`] = this.user.preferences[preferenceType][notification];
      this.$store.dispatch('user:set', settings);
    },
  },
};
</script>
