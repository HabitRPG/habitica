<template lang="pug">
.row.standard-page
  .col-12
    h1 {{ $t('notifications') }}
  .col-12
    .checkbox
      label
        input(type='checkbox', v-model='user.preferences.pushNotifications.unsubscribeFromAll',
        @change='set("pushNotifications", "unsubscribeFromAll")')
        span {{ $t('unsubscribeAllPush') }}

    br

    .checkbox
      label
        input(type='checkbox', v-model='user.preferences.emailNotifications.unsubscribeFromAll',
          @change='set("emailNotifications", "unsubscribeFromAll")')
        span {{ $t('unsubscribeAllEmails') }}
    small {{ $t('unsubscribeAllEmailsText') }}

  .col-8
    table.table
    tr
      td
      th
        span {{ $t('email') }}
      th
        span {{ $t('push') }}
    tr(v-for='notification in notificationsIds')
      td
        span {{ $t(notification) }}
      td
        input(type='checkbox', v-model='user.preferences.emailNotifications[notification]',
          @change='set("emailNotifications", notification)')
      td(v-if="onlyEmailsIds.indexOf(notification) === -1")
        input(type='checkbox', v-model='user.preferences.pushNotifications[notification]',
          @change='set("pushNotifications", notification)')
        hr
</template>

<script>
import { mapState } from 'client/libs/store';
import notificationsMixin from 'client/mixins/notifications';

export default {
  mixins: [notificationsMixin],
  data () {
    return {
      notificationsIds: Object.freeze([
        'newPM',
        'wonChallenge',
        'giftedGems',
        'giftedSubscription',
        'invitedParty',
        'invitedGuild',
        'kickedGroup',
        'questStarted',
        'invitedQuest',
        'importantAnnouncements',
        'weeklyRecaps',
        'onboarding',
        'majorUpdates',
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
    ...mapState({user: 'user.data'}),
  },
  async mounted () {
    // If ?unsubFrom param is passed with valid email type,
    // automatically unsubscribe users from that email and
    // show an alert

    // A simple object to map the key stored in the db (user.preferences.emailNotification[key])
    // to its string id but ONLY when the preferences' key and the string key don't match
    const MAP_PREF_TO_EMAIL_STRING = {
      importantAnnouncements: 'inactivityEmails',
    };

    const unsubFrom = this.$route.query.unsubFrom;

    if (unsubFrom) {
      await this.$store.dispatch('user:set', {
        [`preferences.emailNotifications.${unsubFrom}`]: false,
      });

      const emailTypeString = this.$t(MAP_PREF_TO_EMAIL_STRING[unsubFrom] || unsubFrom);
      this.text(this.$t('correctlyUnsubscribedEmailType', {emailType: emailTypeString}));
    }
  },
  methods: {
    set (preferenceType, notification) {
      let settings = {};
      settings[`preferences.${preferenceType}.${notification}`] = this.user.preferences[preferenceType][notification];
      this.$store.dispatch('user:set', settings);
    },
  },
};
</script>
