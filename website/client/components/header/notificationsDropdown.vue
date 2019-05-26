<template lang="pug">
menu-dropdown.item-notifications(:right="true", @toggled="handleOpenStatusChange", :openStatus="openStatus")
  div(slot="dropdown-toggle")
    div(:aria-label="$t('notifications')", v-b-tooltip.hover.bottom="$t('notifications')")
      message-count(
        v-if='notificationsCount > 0',
        :count="notificationsCount",
        :top="true",
        :gray="!hasUnseenNotifications",
      )
      .top-menu-icon.svg-icon.notifications(v-html="icons.notifications")
  div(slot="dropdown-content")
    .dropdown-item.dropdown-separated.d-flex.justify-content-between.dropdown-inactive.align-items-center(
      @click.stop=""
    )
      h4.dropdown-title(v-once) {{ $t('notifications') }}
      a.small-link.standard-link(@click="dismissAll", :disabled="notificationsCount === 0") {{ $t('dismissAll') }}
    world-boss
    component(
      :is="notification.type",
      :key="notification.id",
      v-for="notification in notifications",
      :notification="notification",
      :can-remove="!isActionable(notification)",
    )
    .dropdown-item.dropdown-separated.d-flex.justify-content-center.dropdown-inactive.no-notifications.flex-column(
      v-if="notificationsCount === 0"
    )
      .svg-icon(v-html="icons.success")
      h2 {{ $t('noNotifications') }}
      p {{ $t('noNotificationsText') }}
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

  .no-notifications {
    h2, p {
      text-align: center;
      color: $gray-200 !important;
    }

    h2 {
      margin-top: 24px;
    }

    p {
      white-space: normal;
      margin-bottom: 43px;
      margin-left: 24px;
      margin-right: 24px;
    }

    .svg-icon {
      margin: 0 auto;
      width: 256px;
      height: 104px;
    }
  }
</style>

<script>
import { mapState, mapActions } from 'client/libs/store';
import quests from 'common/script/content/quests';
import notificationsIcon from 'assets/svg/notifications.svg';
import MenuDropdown from '../ui/customMenuDropdown';
import MessageCount from './messageCount';
import successImage from 'assets/svg/success.svg';

// Notifications
import NEW_STUFF from './notifications/newStuff';
import GROUP_TASK_NEEDS_WORK from './notifications/groupTaskNeedsWork';
import GUILD_INVITATION from './notifications/guildInvitation';
import PARTY_INVITATION from './notifications/partyInvitation';
import CHALLENGE_INVITATION from './notifications/challengeInvitation';
import QUEST_INVITATION from './notifications/questInvitation';
import GROUP_TASK_APPROVAL from './notifications/groupTaskApproval';
import GROUP_TASK_APPROVED from './notifications/groupTaskApproved';
import GROUP_TASK_ASSIGNED from './notifications/groupTaskAssigned';
import UNALLOCATED_STATS_POINTS from './notifications/unallocatedStatsPoints';
import NEW_MYSTERY_ITEMS from './notifications/newMysteryItems';
import CARD_RECEIVED from './notifications/cardReceived';
import NEW_INBOX_MESSAGE from './notifications/newInboxMessage';
import NEW_CHAT_MESSAGE from './notifications/newChatMessage';
import WORLD_BOSS from './notifications/worldBoss';
import VERIFY_USERNAME from './notifications/verifyUsername';

export default {
  components: {
    MenuDropdown,
    MessageCount,
    // One component for each type
    NEW_STUFF, GROUP_TASK_NEEDS_WORK,
    GUILD_INVITATION, PARTY_INVITATION, CHALLENGE_INVITATION,
    QUEST_INVITATION, GROUP_TASK_APPROVAL, GROUP_TASK_APPROVED, GROUP_TASK_ASSIGNED,
    UNALLOCATED_STATS_POINTS, NEW_MYSTERY_ITEMS, CARD_RECEIVED,
    NEW_INBOX_MESSAGE, NEW_CHAT_MESSAGE,
    WorldBoss: WORLD_BOSS,
    VERIFY_USERNAME,
  },
  data () {
    return {
      icons: Object.freeze({
        notifications: notificationsIcon,
        success: successImage,
      }),
      quests,
      openStatus: undefined,
      actionableNotifications: [
        'GUILD_INVITATION', 'PARTY_INVITATION', 'CHALLENGE_INVITATION',
        'QUEST_INVITATION', 'GROUP_TASK_NEEDS_WORK', 'GROUP_TASK_APPROVAL',
      ],
      // A list of notifications handled by this component,
      // listed in the order they should appear in the notifications panel.
      // NOTE: Those not listed here won't be shown in the notification panel!
      handledNotifications: [
        'NEW_STUFF', 'GROUP_TASK_NEEDS_WORK',
        'GUILD_INVITATION', 'PARTY_INVITATION', 'CHALLENGE_INVITATION',
        'QUEST_INVITATION', 'GROUP_TASK_ASSIGNED', 'GROUP_TASK_APPROVAL', 'GROUP_TASK_APPROVED',
        'NEW_MYSTERY_ITEMS', 'CARD_RECEIVED',
        'NEW_INBOX_MESSAGE', 'NEW_CHAT_MESSAGE', 'UNALLOCATED_STATS_POINTS',
        'VERIFY_USERNAME',
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

      if (this.user.flags.verifiedUsername !== true) {
        notifications.push({
          type: 'VERIFY_USERNAME',
          data: {
            username: this.user.auth.local.username,
          },
          id: 'custom-change-username',
        });
      }

      const orderMap = this.notificationsOrder;

      // Push the notifications stored in user.notifications
      // skipping those not defined in the handledNotifications object
      notifications.push(...this.user.notifications.filter(notification => {
        if (notification.type === 'UNALLOCATED_STATS_POINTS') {
          if (!this.hasClass) return false;
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
    // The total number of notification, shown inside the dropdown
    notificationsCount () {
      return this.notifications.length;
    },
    hasUnseenNotifications () {
      return this.notifications.some((notification) => {
        return notification.seen === false ? true : false;
      });
    },
    hasClass () {
      return this.$store.getters['members:hasClass'](this.user);
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
  },
};
</script>
