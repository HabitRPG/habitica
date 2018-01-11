<template lang="pug">
menu-dropdown.item-notifications(:right="true", @toggled="handleOpenStatusChange", :openStatus="openStatus")
  div(slot="dropdown-toggle")
    div(v-b-tooltip.hover.bottom="$t('notifications')")
      message-count(v-if='notificationsTopBadgeCount > 0', :count="notificationsTopBadgeCount", :top="true")
      .top-menu-icon.svg-icon.notifications(v-html="icons.notifications")
  div(slot="dropdown-content")
    .dropdown-item.dropdown-separated.d-flex.justify-content-between.dropdown-inactive.align-items-center(
      @click.stop=""
    )
      .d-flex.align-items-center
        h4.dropdown-title(v-once) {{ $t('notifications') }}
        div
          span.badge.badge-pill.badge-default {{ notificationsCount }}
      a.small-link.standard-link(@click="dismissAll") {{ $t('dismissAll') }}
    component(
      :is="notification.type",
      :key="notification.id",
      v-for="notification in notifications",
      :notification="notification",
      :can-remove="!isActionable(notification)",
    )
    //
      a.dropdown-item(v-if='user.party.quest && user.party.quest.RSVPNeeded')
        div {{ $t('invitedTo', {name: quests.quests[user.party.quest.key].text()}) }}
        div
          button.btn.btn-primary(@click.stop='questAccept(user.party._id)') Accept
          button.btn.btn-primary(@click.stop='questReject(user.party._id)') Reject
      a.dropdown-item(v-for='message in userNewMessages', :key='message.key')
        span(@click='navigateToGroup(message.key)')
          span.glyphicon.glyphicon-comment
          span {{message.name}}
        span.clear-button(@click.stop='clearMessages(message.key)') Clear
      a.dropdown-item(v-for='notification in groupNotifications', :key='notification.id')
        span(:class="groupApprovalNotificationIcon(notification)")
        span {{notification.data.message}}
        span.clear-button(@click.stop='viewGroupApprovalNotification(notification)') Clear
</template>

<style lang='scss' scoped>
@import '~client/assets/scss/colors.scss';

.dropdown-item {
  padding: 16px 24px;
  width: 378px;
}

.dropdown-title {
  margin-bottom: 0px;
  margin-right: 8px;
  line-height: 1.5;
}
</style>

<script>
/* TODO
import axios from 'axios';
import isEmpty from 'lodash/isEmpty';
import map from 'lodash/map';

import * as Analytics from 'client/libs/analytics';
*/

import { mapState, mapActions } from 'client/libs/store';
import quests from 'common/script/content/quests';
import notificationsIcon from 'assets/svg/notifications.svg';
import MenuDropdown from '../ui/customMenuDropdown';
import MessageCount from './messageCount';

// Notifications
import NEW_STUFF from './notifications/newStuff';
import GROUP_TASK_NEEDS_WORK from './notifications/groupTaskNeedsWork';
import GUILD_INVITATION from './notifications/guildInvitation';
import PARTY_INVITATION from './notifications/partyInvitation';
import CHALLENGE_INVITATION from './notifications/challengeInvitation';
import QUEST_INVITATION from './notifications/questInvitation';
import GROUP_TASK_APPROVAL from './notifications/groupTaskApproval';
import GROUP_TASK_APPROVED from './notifications/groupTaskApproved';
import UNALLOCATED_STATS_POINTS from './notifications/unallocatedStatsPoints';
import NEW_MYSTERY_ITEMS from './notifications/newMysteryItems';
import CARD_RECEIVED from './notifications/cardReceived';
import NEW_INBOX_MESSAGE from './notifications/newInboxMessage';
import NEW_GROUP_MESSAGE from './notifications/newGroupMessage';

export default {
  components: {
    MenuDropdown,
    MessageCount,
    // One component for each type
    NEW_STUFF, GROUP_TASK_NEEDS_WORK,
    GUILD_INVITATION, PARTY_INVITATION, CHALLENGE_INVITATION,
    QUEST_INVITATION, GROUP_TASK_APPROVAL, GROUP_TASK_APPROVED,
    UNALLOCATED_STATS_POINTS, NEW_MYSTERY_ITEMS, CARD_RECEIVED,
    NEW_INBOX_MESSAGE, NEW_GROUP_MESSAGE,
  },
  data () {
    return {
      icons: Object.freeze({
        notifications: notificationsIcon,
      }),
      quests,
      openStatus: undefined,
      actionableNotifications: [
        'GUILD_INVITATION', 'PARTY_INVITATION', 'CHALLENGE_INVITATION',
        'QUEST_INVITATION', 'GROUP_TASK_NEEDS_WORK',
      ],
      // A list of notifications handled by this component,
      // listed in the order they should appear in the notifications panel.
      // NOTE: Those not listed here won't be shown in the notification panel!
      handledNotifications: [
        'NEW_STUFF', 'GROUP_TASK_NEEDS_WORK',
        'GUILD_INVITATION', 'PARTY_INVITATION', 'CHALLENGE_INVITATION',
        'QUEST_INVITATION', 'GROUP_TASK_APPROVAL', 'GROUP_TASK_APPROVED',
        'UNALLOCATED_STATS_POINTS', 'NEW_MYSTERY_ITEMS', 'CARD_RECEIVED',
        'NEW_INBOX_MESSAGE', 'NEW_GROUP_MESSAGE',
      ],
    };
  },
  computed: {
    ...mapState({user: 'user.data'}),
    notificationsOrder () {
      // Returns a map of NOTIFICATION_TYPE -> POSITION
      const orderMap = {};

      this.handledNotifications.forEach((type, index) => {
        orderMap[type] = index;
      });

      return orderMap;
    },
    notifications () {
      // Convert the notifications not stored in user.notifications
      const notifications = [];

      // Parties invitations
      notifications.push(...this.user.invitations.parties.map(partyInvitation => {
        return {
          type: 'PARTY_INVITATION',
          data: partyInvitation,
          // Create a custom id for notifications outside user.notifications (must be unique)
          id: `custom-party-invitation-${partyInvitation.id}`,
        };
      }));

      // Guilds invitations
      notifications.push(...this.user.invitations.guilds.map(guildInvitation => {
        return {
          type: 'GUILD_INVITATION',
          data: guildInvitation,
          // Create a custom id for notifications outside user.notifications (must be unique)
          id: `custom-guild-invitation-${guildInvitation.id}`,
        };
      }));

      // Quest invitation
      if (this.user.party.quest.RSVPNeeded === true) {
        notifications.push({
          type: 'QUEST_INVITATION',
          data: {
            quest: this.user.party.quest.key,
            partyId: this.user.party._id,
          },
          // Create a custom id for notifications outside user.notifications (must be unique)
          id: `custom-quest-invitation-${this.user.party._id}`,
        });
      }

      const orderMap = this.notificationsOrder;

      // Push the notifications stored in user.notifications
      // skipping those not defined in the handledNotifications object
      notifications.push(...this.user.notifications.filter(notification => {
        if (notification.type === 'UNALLOCATED_STATS_POINTS') {
          if (!this.user.flags.classSelected || this.user.preferences.disableClasses) return false;
        }

        return orderMap[notification.type] !== undefined;
      }));

      // Sort notifications
      notifications.sort((a, b) => { // a and b are notifications
        const aOrder = orderMap[a.type];
        const bOrder = orderMap[b.type];

        if (aOrder === bOrder) return 0; // Same position
        if (aOrder > bOrder) return 1; // b is higher
        if (aOrder < bOrder) return -1; // a is higher
      });

      return notifications;
    },
    // The notification top badge includes unseen notifications + actionable ones
    notificationsTopBadgeCount () {
      return this.notifications.reduce((count, notification) => {
        if (notification.seen === false || this.isActionable(notification)) {
          count++;
        }
        return count;
      }, 0);
    },
    // The total number of notification, shown inside the dropdown
    notificationsCount () {
      return this.notifications.length;
    },
  },
  methods: {
    ...mapActions({
      readNotifications: 'notifications:readNotifications',
      seeNotifications: 'notifications:seeNotifications',
    }),
    handleOpenStatusChange (openStatus) {
      this.openStatus = openStatus === true ? 1 : 0;

      // Mark notifications as seen when the menu is opened
      if (openStatus) this.markAllAsSeen();
    },
    markAllAsSeen () {
      const idsToSee = this.notifications.map(notification => {
        // We check explicitly for notification.id not starting with `custom-` because some
        // notification don't follow the standard
        // (all those not stored in user.notifications)
        if (notification.seen === false && notification.id && notification.id.indexOf('custom-') !== 0) {
          return notification.id;
        }
      }).filter(id => Boolean(id));

      if (idsToSee.length > 0) this.seeNotifications({notificationIds: idsToSee});
    },
    dismissAll () {
      const idsToRead = this.notifications.map(notification => {
        // We check explicitly for notification.id not starting with `custom-` because some
        // notification don't follow the standard
        // (all those not stored in user.notifications)
        if (!this.isActionable(notification) && notification.id.indexOf('custom-') !== 0) {
          return notification.id;
        }
      }).filter(id => Boolean(id));
      this.openStatus = 0;

      if (idsToRead.length > 0) this.readNotifications({notificationIds: idsToRead});
    },
    isActionable (notification) {
      return this.actionableNotifications.indexOf(notification.type) !== -1;
    },
    /*
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
    clearMessages (key) { TODO DO NOT DELETE YET
      this.$store.dispatch('chat:markChatSeen', {groupId: key});
      this.$delete(this.user.newMessages, key);
    },
    viewGroupApprovalNotification (notification) {
      this.$store.state.groupNotifications = this.groupNotifications.filter(groupNotif => {
        return groupNotif.id !== notification.id;
      });

      axios.post('/api/v3/notifications/read', {
        notificationIds: [notification.id],
      });
    },
    groupApprovalNotificationIcon (notification) {
      if (notification.type === 'GROUP_TASK_APPROVAL') {
        return 'glyphicon glyphicon-question-sign';
      } else if (notification.type === 'GROUP_TASK_APPROVED') {
        return 'glyphicon glyphicon-ok-sign';
      }
    },
    async questAccept (partyId) {
      let quest = await this.$store.dispatch('quests:sendAction', {groupId: partyId, action: 'quests/accept'});
      this.user.party.quest = quest;
    },
    async questReject (partyId) {
      let quest = await this.$store.dispatch('quests:sendAction', {groupId: partyId, action: 'quests/reject'});
      this.user.party.quest = quest;
    },
    */
  },
};
</script>
