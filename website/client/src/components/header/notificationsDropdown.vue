<template>
  <menu-dropdown
    class="item-notifications"
    :right="true"
    :open-status="openStatus"
    @toggled="handleOpenStatusChange"
  >
    <div slot="dropdown-toggle">
      <div
        v-b-tooltip.hover.bottom="$t('notifications')"
        :aria-label="$t('notifications')"
      >
        <message-count
          v-if="notificationsCount > 0 || hasSpecialBadge"
          :count="notificationsCount"
          :top="true"
          :gray="!hasUnseenNotifications && !hasSpecialBadge"
          :badge="hasSpecialBadge ? icons.starBadge : null"
        />
        <div
          class="top-menu-icon svg-icon notifications"
          v-html="icons.notifications"
        ></div>
      </div>
    </div>
    <div
      v-if="openStatus === 1"
      slot="dropdown-content"
    >
      <div
        class="dropdown-item dropdown-separated
         d-flex justify-content-between dropdown-inactive align-items-center"
        @click.stop
      >
        <h4
          v-once
          class="dropdown-title"
        >
          {{ $t('notifications') }}
        </h4>
        <a
          class="small-link"
          :disabled="notificationsCount === 0"
          @click="dismissAll"
        >{{ $t('dismissAll') }}</a>
      </div>
      <world-boss />
      <onboarding-guide
        v-if="showOnboardingGuide"
        :never-seen="hasSpecialBadge"
      />
      <component
        :is="notification.type"
        v-for="notification in notifications"
        :key="notification.id"
        :notification="notification"
        :can-remove="!isActionable(notification)"
      />
      <div
        v-if="notificationsCount === 0 && !showOnboardingGuide"
        class="dropdown-item dropdown-separated
         d-flex justify-content-center dropdown-inactive no-notifications flex-column"
      >
        <div
          class="svg-icon"
          v-html="icons.success"
        ></div>
        <h2>{{ $t('noNotifications') }}</h2>
        <p>{{ $t('noNotificationsText') }}</p>
      </div>
    </div>
  </menu-dropdown>
</template>

<style lang='scss' scoped>
  @import '~@/assets/scss/colors.scss';

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
import { mapState, mapActions } from '@/libs/store';
import * as quests from '@/../../common/script/content/quests';
import { hasCompletedOnboarding } from '@/../../common/script/libs/onboarding';
import notificationsIcon from '@/assets/svg/notifications.svg';
import MenuDropdown from '../ui/customMenuDropdown';
import MessageCount from './messageCount';
import { CONSTANTS, getLocalSetting, setLocalSetting } from '@/libs/userlocalManager';
import successImage from '@/assets/svg/success.svg';
import starBadge from '@/assets/svg/star-badge.svg';

// Notifications
import CARD_RECEIVED from './notifications/cardReceived';
import CHALLENGE_INVITATION from './notifications/challengeInvitation';
import GIFT_ONE_GET_ONE from './notifications/g1g1';
import GROUP_TASK_ASSIGNED from './notifications/groupTaskAssigned';
import GROUP_TASK_CLAIMED from './notifications/groupTaskClaimed';
import GROUP_TASK_NEEDS_WORK from './notifications/groupTaskNeedsWork';
import GUILD_INVITATION from './notifications/guildInvitation';
import ITEM_RECEIVED from './notifications/itemReceived';
import NEW_CHAT_MESSAGE from './notifications/newChatMessage';
import NEW_INBOX_MESSAGE from './notifications/newPrivateMessage';
import NEW_MYSTERY_ITEMS from './notifications/newMysteryItems';
import NEW_STUFF from './notifications/newStuff';
import ONBOARDING_COMPLETE from './notifications/onboardingComplete';
import PARTY_INVITATION from './notifications/partyInvitation';
import QUEST_INVITATION from './notifications/questInvitation';
import UNALLOCATED_STATS_POINTS from './notifications/unallocatedStatsPoints';
import VERIFY_USERNAME from './notifications/verifyUsername';
import WORLD_BOSS from './notifications/worldBoss';
import OnboardingGuide from './onboardingGuide';

export default {
  components: {
    MenuDropdown,
    MessageCount,
    // One component for each type
    CARD_RECEIVED,
    CHALLENGE_INVITATION,
    GIFT_ONE_GET_ONE,
    GROUP_TASK_ASSIGNED,
    GROUP_TASK_CLAIMED,
    GROUP_TASK_NEEDS_WORK,
    GUILD_INVITATION,
    ITEM_RECEIVED,
    NEW_CHAT_MESSAGE,
    NEW_INBOX_MESSAGE,
    NEW_MYSTERY_ITEMS,
    NEW_STUFF,
    ONBOARDING_COMPLETE,
    PARTY_INVITATION,
    QUEST_INVITATION,
    UNALLOCATED_STATS_POINTS,
    VERIFY_USERNAME,
    WorldBoss: WORLD_BOSS,
    OnboardingGuide,
  },
  data () {
    return {
      icons: Object.freeze({
        notifications: notificationsIcon,
        success: successImage,
        starBadge,
      }),
      hasSpecialBadge: false,
      quests,
      openStatus: undefined,
      actionableNotifications: [
        'GUILD_INVITATION', 'PARTY_INVITATION', 'CHALLENGE_INVITATION',
        'QUEST_INVITATION',
      ],
      // A list of notifications handled by this component,
      // listed in the order they should appear in the notifications panel.
      // NOTE: Those not listed here won't be shown in the notification panel!
      handledNotifications: [
        'NEW_STUFF',
        'ITEM_RECEIVED',
        'GIFT_ONE_GET_ONE',
        'GROUP_TASK_NEEDS_WORK',
        'GUILD_INVITATION',
        'PARTY_INVITATION',
        'CHALLENGE_INVITATION',
        'QUEST_INVITATION',
        'GROUP_TASK_ASSIGNED',
        'GROUP_TASK_CLAIMED',
        'NEW_MYSTERY_ITEMS',
        'CARD_RECEIVED',
        'NEW_INBOX_MESSAGE',
        'NEW_CHAT_MESSAGE',
        'UNALLOCATED_STATS_POINTS',
        'VERIFY_USERNAME',
        'ONBOARDING_COMPLETE',
      ],
    };
  },
  computed: {
    ...mapState({ user: 'user.data' }),
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
      notifications.push(...this.user.invitations.parties.map(partyInvitation => ({
        type: 'PARTY_INVITATION',
        data: partyInvitation,
        // Create a custom id for notifications outside user.notifications (must be unique)
        id: `custom-party-invitation-${partyInvitation.id}`,
      })));

      // Guilds invitations
      notifications.push(...this.user.invitations.guilds.map(guildInvitation => ({
        type: 'GUILD_INVITATION',
        data: guildInvitation,
        // Create a custom id for notifications outside user.notifications (must be unique)
        id: `custom-guild-invitation-${guildInvitation.id}`,
      })));

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
      // a and b are notifications
      notifications.sort((a, b) => { // eslint-disable-line array-callback-return, consistent-return
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
      return this.notifications.some(notification => (notification.seen === false));
    },
    hasClass () {
      return this.$store.getters['members:hasClass'](this.user);
    },
    showOnboardingGuide () {
      return !hasCompletedOnboarding(this.user);
    },
  },
  mounted () {
    const onboardingPanelState = getLocalSetting(CONSTANTS.keyConstants.ONBOARDING_PANEL_STATE);
    if (
      onboardingPanelState !== CONSTANTS.onboardingPanelValues.PANEL_OPENED
      && this.showOnboardingGuide
    ) {
      // The first time the onboarding panel is opened a special
      // badge for notifications should be used
      this.hasSpecialBadge = true;
    }
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

      // Reset the special notification badge as soon as it's opened
      if (this.hasSpecialBadge) {
        setLocalSetting(
          CONSTANTS.keyConstants.ONBOARDING_PANEL_STATE,
          CONSTANTS.onboardingPanelValues.PANEL_OPENED,
        );

        setTimeout(() => {
          this.hasSpecialBadge = false;
        }, 100);
      }
    },
    markAllAsSeen () {
      const idsToSee = this.notifications.map(notification => {
        // We check explicitly for notification.id not starting with `custom-` because some
        // notification don't follow the standard
        // (all those not stored in user.notifications)
        if (notification.seen === false && notification.id && notification.id.indexOf('custom-') !== 0) {
          return notification.id;
        }
        return null;
      }).filter(id => Boolean(id));

      if (idsToSee.length > 0) this.seeNotifications({ notificationIds: idsToSee });
    },
    dismissAll () {
      const idsToRead = this.notifications.map(notification => {
        // We check explicitly for notification.id not starting with `custom-` because some
        // notification don't follow the standard
        // (all those not stored in user.notifications)
        if (!this.isActionable(notification) && notification.id.indexOf('custom-') !== 0) {
          return notification.id;
        }
        return null;
      }).filter(id => Boolean(id));
      this.openStatus = 0;

      if (idsToRead.length > 0) this.readNotifications({ notificationIds: idsToRead });
    },
    isActionable (notification) {
      return this.actionableNotifications.indexOf(notification.type) !== -1;
    },
  },

};
</script>
