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
    tr(v-for='notification in notifications')
      td
        span {{ $t(notification) }}
      td
        input(type='checkbox', v-model='user.preferences.emailNotifications[notification]',
          @change='set("emailNotifications", notification)')
      td
        input(type='checkbox', v-model='user.preferences.pushNotifications[notification]',
          @change='set("pushNotifications", notification)')
        hr
</template>

<script>
import { mapState } from 'client/libs/store';

export default {
  data () {
    return {
      notifications: [
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
      ],
    };
  },
  computed: {
    ...mapState({user: 'user.data'}),
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
