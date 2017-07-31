<template lang="pug">
.item-with-icon.item-notifications.dropdown
  .svg-icon(v-html="icons.notifications")
  // span.glyphicon(:class='iconClasses()')
  // span.notification-counter(v-if='getNotificationsCount()') {{getNotificationsCount()}}
  .dropdown-menu.dropdown-menu-right.user-dropdown
    h4.dropdown-item(v-if='!hasNoNotifications()') {{ $t('notifications') }}
    h4.dropdown-item.toolbar-notifs-no-messages(v-if='hasNoNotifications()') {{ $t('noNotifications') }}
    a.dropdown-item(v-if='user.purchased.plan.mysteryItems.length', @click='$state.go("options.inventory.drops"); ')
      span.glyphicon.glyphicon-gift
      span {{ $t('newSubscriberItem') }}
    a.dropdown-item(v-for='party in user.invitations.parties', ui-sref='options.social.party')
      span.glyphicon.glyphicon-user
      span {{ $t('invitedTo', {name: party.name}) }}
    a.dropdown-item(v-if='user.flags.cardReceived', @click='$state.go("options.inventory.drops"); ')
      span.glyphicon.glyphicon-envelope
      span {{ $t('cardReceived') }}
      a.dropdown-item(@click='clearCards()', :popover="$t('clear')", popover-placement='right', popover-trigger='mouseenter',popover-append-to-body='true')
    a.dropdown-item(v-for='guild in user.invitations.guilds', ui-sref='options.social.guilds.public')
      span.glyphicon.glyphicon-user
      span {{ $t('invitedTo', {name: guild.name}) }}
    a.dropdown-item(v-if='user.flags.classSelected && !user.preferences.disableClasses && user.stats.points', ui-sref='options.profile.stats')
      span.glyphicon.glyphicon-plus-sign
      span {{ $t('haveUnallocated', {points: user.stats.points}) }}
    a.dropdown-item(v-for='(k,v) in user.newMessages', v-if='v.value', @click='(k === party._id || k === user.party._id) ? $state.go("options.social.party") : $state.go("options.social.guilds.detail",{gid:k}); ')
      span.glyphicon.glyphicon-comment
      span {{v.name}}
    a.dropdown-item(@click='clearMessages(k)', :popover="$t('clear')", popover-placement='right', popover-trigger='mouseenter',popover-append-to-body='true')
    a.dropdown-item(v-for='notification in user.groupNotifications', @click='viewGroupApprovalNotification(notification, $index, true)')
      span(:class="groupApprovalNotificationIcon(notification)")
      span
        | {{notification.data.message}}
      a.dropdown-item(@click='viewGroupApprovalNotification(notification, $index)',
        :popover="$t('clear')",
        popover-placement='right',
        popover-trigger='mouseenter',
        popover-append-to-body='true')
        span.glyphicon.glyphicon-remove-circle
</template>

<style lang='scss' scoped>
  @import '~client/assets/scss/colors.scss';
  .svg-icon {
    width: 25px;
  }

  .item-notifications:hover {
    cursor: pointer;
  }

  /* @TODO: Move to shared css */
  .dropdown:hover .dropdown-menu {
    display: block;
    margin-top: 0; // remove the gap so it doesn't close
  }

  .dropdown + .dropdown {
    margin-left: 0px;
  }

  .dropdown-menu:not(.user-dropdown) {
    background: $purple-200;
    border-radius: 0px;
    border: none;
    box-shadow: none;
    padding: 0px;

    border-bottom-right-radius: 5px;
    border-bottom-left-radius: 5px;

    .dropdown-item {
      font-size: 16px;
      box-shadow: none;
      color: $white;
      border: none;
      line-height: 1.5;

      &.active {
        background: $purple-300;
      }

      &:hover {
        background: $purple-300;

        &:last-child {
          border-bottom-right-radius: 5px;
          border-bottom-left-radius: 5px;
        }
      }
    }
  }
</style>

<script>
import isEmpty from 'lodash/isEmpty';
import map from 'lodash/map';

import { mapState } from 'client/libs/store';
import quests from 'common/script/content/quests';
import notificationsIcon from 'assets/svg/notifications.svg';

export default {
  data () {
    return {
      icons: Object.freeze({
        notifications: notificationsIcon,
      }),
    };
  },
  computed: {
    ...mapState({user: 'user.data'}),
    party () {
      return {name: ''};
      // return this.user.party;
    },
  },
  methods: {
    // @TODO: I hate this function, we can do better with a hashmap
    selectNotificationValue (mysteryValue, invitationValue, cardValue,
      unallocatedValue, messageValue, noneValue, groupApprovalRequested, groupApproved) {
      let user = this.user;

      if (user.purchased && user.purchased.plan && user.purchased.plan.mysteryItems && user.purchased.plan.mysteryItems.length) {
        return mysteryValue;
      } else if (user.invitations.parties && user.invitations.parties.length > 0 || user.invitations.guilds && user.invitations.guilds.length > 0) {
        return invitationValue;
      } else if (user.flags.cardReceived) {
        return cardValue;
      } else if (user.flags.classSelected && !(user.preferences && user.preferences.disableClasses) && user.stats.points) {
        return unallocatedValue;
      } else if (!isEmpty(user.newMessages)) {
        return messageValue;
      } else if (!isEmpty(user.groupNotifications)) {
        let groupNotificationTypes = map(user.groupNotifications, 'type');
        if (groupNotificationTypes.indexOf('GROUP_TASK_APPROVAL') !== -1) {
          return groupApprovalRequested;
        } else if (groupNotificationTypes.indexOf('GROUP_TASK_APPROVED') !== -1) {
          return groupApproved;
        }
        return noneValue;
      } else {
        return noneValue;
      }
    },
    hasQuestProgress () {
      let user = this.user;
      if (user.party.quest) {
        let userQuest = quests[user.party.quest.key];

        if (!userQuest) {
          return false;
        }
        if (userQuest.boss && user.party.quest.progress.up > 0) {
          return true;
        }
        if (userQuest.collect && user.party.quest.progress.collectedItems > 0) {
          return true;
        }
      }
      return false;
    },
    getQuestInfo () {
      let user = this.user;
      let questInfo = {};
      if (user.party.quest) {
        let userQuest = quests[user.party.quest.key];

        questInfo.title = userQuest.text();

        if (userQuest.boss) {
          questInfo.body =  this.$t('questTaskDamage', { damage: user.party.quest.progress.up.toFixed(1) });
        } else if (userQuest.collect) {
          questInfo.body = this.$t('questTaskCollection', { items: user.party.quest.progress.collectedItems });
        }
      }
      return questInfo;
    },
    clearMessages () {
      this.$store.dispatch('chat:markChatSeen');
    },
    clearCards () {
      this.$store.dispatch('chat:clearCards');
    },
    getNotificationsCount () {
      let count = 0;

      if (this.user.invitations.parties) {
        count += this.user.invitations.parties.length;
      }

      if (this.user.purchased.plan && this.user.purchased.plan.mysteryItems.length) {
        count++;
      }

      if (this.user.invitations.guilds) {
        count += this.user.invitations.guilds.length;
      }

      if (this.user.flags.classSelected && !this.user.preferences.disableClasses && this.user.stats.points) {
        count += this.user.stats.points > 0 ? 1 : 0;
      }

      if (this.user.newMessages) {
        count += Object.keys(this.user.newMessages).length;
      }

      return count;
    },
    iconClasses () {
      return this.selectNotificationValue(
        'glyphicon-gift',
        'glyphicon-user',
        'glyphicon-envelope',
        'glyphicon-plus-sign',
        'glyphicon-comment',
        'glyphicon-comment inactive',
        'glyphicon-question-sign',
        'glyphicon-ok-sign'
      );
    },
    hasNoNotifications () {
      return this.selectNotificationValue(false, false, false, false, false, true, false, false);
    },
    viewGroupApprovalNotification (notification, index, navigate) {
      // @TODO: USe notifications: User.readNotification(notification.id);
      this.user.groupNotifications.splice(index, 1);
      return navigate; // @TODO: remove
      // @TODO: this.$route.go if (navigate) $state.go('options.social.guilds.detail', {gid: notification.data.groupId});
    },
    groupApprovalNotificationIcon (notification) {
      if (notification.type === 'GROUP_TASK_APPROVAL') {
        return 'glyphicon glyphicon-question-sign';
      } else if (notification.type === 'GROUP_TASK_APPROVED') {
        return 'glyphicon glyphicon-ok-sign';
      }
    },
  },
};
</script>
