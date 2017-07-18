<template lang="pug">
.row
  .personal-options.col-md-6
    .panel.panel-default
      .panel-heading {{ $t('notifications') }}
      .panel-body
        table.table
          tr
            td
            th
              span {{ $t('email') }}
            th
              span {{ $t('push') }}
          -var unsubscribeFromAllEmails = 'user.preferences.emailNotifications.unsubscribeFromAll'
          -var unsubscribeFromAllPush = 'user.preferences.pushNotifications.unsubscribeFromAll'
          each notification in ['newPM', 'wonChallenge', 'giftedGems', 'giftedSubscription', 'invitedParty', 'invitedGuild', 'kickedGroup', 'questStarted', 'invitedQuest', 'importantAnnouncements', 'weeklyRecaps', 'onboarding']
            tr
              td
                span {{ $t('notification') }}
              td
                -var preference = 'user.preferences.emailNotifications.' + notification
                input(type='checkbox', ng-model='#{preference}',
                  ng-disabled='#{unsubscribeFromAllEmails} === true || #{preference} === undefined',
                  ng-checked='#{unsubscribeFromAllEmails} === false && #{preference} === true',
                  ng-change='set({"preferences.emailNotifications.#{notification}": #{preference} ? true: false})')
              td
                -var preference = 'user.preferences.pushNotifications.' + notification
                input(type='checkbox', ng-model='#{preference}',
                  ng-disabled='#{unsubscribeFromAllPush} === true || #{preference} === undefined',
                  ng-checked='#{unsubscribeFromAllPush} === false && #{preference} === true',
                  ng-change='set({"preferences.pushNotifications.#{notification}": #{preference} ? true: false})')

        hr

        .checkbox
          label
            input(type='checkbox', ng-model='user.preferences.pushNotifications.unsubscribeFromAll',
            ng-change='set({"preferences.pushNotifications.unsubscribeFromAll": user.preferences.pushNotifications.unsubscribeFromAll ? true: false})')
            span {{ $t('unsubscribeAllPush') }}

        .checkbox
          label
            input(type='checkbox', ng-model='user.preferences.emailNotifications.unsubscribeFromAll',
            ng-change='set({"preferences.emailNotifications.unsubscribeFromAll": user.preferences.emailNotifications.unsubscribeFromAll ? true: false})')
            span {{ $t('unsubscribeAllEmails') }}

        small {{ $t('unsubscribeAllEmailsText') }}
</template>
