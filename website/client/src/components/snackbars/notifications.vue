<template>
  <div
    class="notifications"
    :class="notificationsTopPosClass"
    :style="{'--current-scrollY': notificationTopY}"
  >
    <transition-group
      name="notifications"
      class="animations-holder"
      appear
    >
      <notification
        v-for="(notification, index) in visibleNotifications"
        :key="notification.uuid"
        :notification="notification"
        class="notification-item"
        :visible-amount="index"
        @clicked="notificationRemoved(notification)"
        @hidden="notificationRemoved($event)"
      />
    </transition-group>
  </div>
</template>

<style lang="scss" scoped>
  .notifications {
    position: fixed;
    right: 10px;
    width: 350px;
    z-index: 1400; // 1400 is above modal backgrounds

    top: var(--current-scrollY);

    justify-content: flex-end;
    display: flex;
  }

  .animations-holder {
    position: relative;
    display: block;
  }

  .notification-item {
    transition: transform 0.25s ease-in, opacity 0.25s ease-in;
  }

  .notifications-move {
    // transition: transform .5s;
  }

  .notifications-enter-active {
    // transition: opacity .5s;
  }

  .notifications-leave-active {
    position: absolute;
    right: 0;
  }

  .notifications-enter,
  .notifications-leave-to {
    opacity: 0;
    right: 0;
  }
</style>

<script>
import { mapState } from '@/libs/store';
import notification from './notification';
import { sleepAsync } from '../../../../common/script/libs/sleepAsync';

const NOTIFICATIONS_VISIBLE_AT_ONCE = 4;
const REMOVAL_INTERVAL = 2500;
const DELAY_DELETE_AND_NEW = 60;
const DELAY_FILLING_ENTRIES = 240;

export default {
  components: {
    notification,
  },
  props: {
    preventQueue: {
      type: Boolean,
      default: false,
    },
    debugMode: {
      type: Boolean,
      default: false,
    },
  },
  data () {
    return {
      visibleNotifications: [],
      allowedToFillAgain: true,
      removalIntervalId: null,
      notificationTopY: '0px',
      preventMultipleWatchExecution: false,
    };
  },
  computed: {
    ...mapState({
      notificationStore: 'notificationStore',
      userSleeping: 'user.data.preferences.sleep',
    }),
    notificationsTopPosClass () {
      const base = 'notifications-top-pos-';
      let modifier = '';

      if (this.userSleeping) {
        modifier = 'sleeping';
      } else {
        modifier = 'normal';
      }

      return `${base}${modifier} scroll-${this.scrollY}`;
    },
    notificationBannerHeight () {
      let scrollPosToCheck = 0;
      if (this.userSleeping) {
        scrollPosToCheck = 98;
      } else {
        scrollPosToCheck = 56;
      }
      return scrollPosToCheck;
    },
    visibleNotificationsWithoutErrors () {
      return this.visibleNotifications.filter(n => n.type !== 'error');
    },
  },
  watch: {
    notificationStore: async function notificationStore (notifications) {
      if (this.preventMultipleWatchExecution) {
        return;
      }

      this.preventMultipleWatchExecution = true;

      this.debug('notifications changed', {
        notifications: notifications.length,
      });

      // if the timer is already running, stop it
      // otherwise a newly added notification might just disappear faster
      this.stopNotificationsRemovalTimer();

      const fillingPromise = this.triggerFillUntilFull();

      this.triggerRemovalTimerIfAllowed();

      await fillingPromise;

      this.preventMultipleWatchExecution = false;
    },
  },
  mounted () {
    window.addEventListener('scroll', this.updateScrollY, { passive: true });
    this.updateScrollY();
  },

  destroyed () {
    window.removeEventListener('scroll', this.updateScrollY, { passive: true });
  },
  methods: {
    debug (...args) {
      if (this.debugMode) {
        console.info(...args); // eslint-disable-line no-console
      }
    },
    notificationRemoved ($event) {
      // findIndex+splice is the way to go on removing, instead of .filter
      // due to the way vue handles new arrays / entries even if you use :key="uuid"
      // the notification object was replaced and prevented to stop the right timer => to remove it
      const foundNotification = this.visibleNotifications.findIndex(n => n.uuid === $event.uuid);

      this.visibleNotifications.splice(foundNotification, 1);

      this.updateAllowedToFillAgain();
      this.$store.dispatch('snackbars:remove', $event);

      this.debug('removed', {
        allowedToFillAgain: this.allowedToFillAgain,
        storeLength: this.notificationStore.length,
      });

      if (this.allowedToFillAgain) {
        // reset the flag so that the next call (for a new notification) will be immediately
        if (this.visibleNotificationsWithoutErrors.length !== 0) {
          this.debug('start timeout to fill again');
          setTimeout(() => {
            this.debug('before fill new notifications');
            this.triggerFillUntilFull();

            this.triggerRemovalTimerIfAllowed();
          }, DELAY_DELETE_AND_NEW);
        }
      }
    },
    fillVisibleNotifications (notifications) {
      this.debug({
        fillAgain: this.allowedToFillAgain,
        visible: this.visibleNotifications.length,
        notifications: notifications.length,
      });

      // the generic checks - new notification array has enough items
      // is allowed to be filled and don't do anything while the visible items are 2
      if (notifications.length === 0 || !this.allowedToFillAgain
          || this.visibleNotifications.length === NOTIFICATIONS_VISIBLE_AT_ONCE) {
        this.debug('stop fill - 1');
        return;
      }

      // this checks if the visible items are the current ones in the notifications array
      // if so - there is no need to continue, for example on only one visible notification,
      // it doesn't need to go with the loop again
      if (notifications.length === this.visibleNotifications.length) {
        const visibleIds = this.visibleNotifications.map(n => n.uuid);

        const allTheSame = notifications.every(n => visibleIds.includes(n.uuid));

        if (allTheSame) {
          this.debug('stop fill - 2', {
            visibleIds,
            notifications: notifications.length,
            notificationsStore: this.notificationStore.length,
          });
          return;
        }
      }

      // fill the new items that needs to be visible
      if (this.visibleNotifications.length < NOTIFICATIONS_VISIBLE_AT_ONCE) {
        const visibleIds = this.visibleNotifications.map(n => n.uuid);

        const notAddedYet = notifications.filter(n => !visibleIds.includes(n.uuid));

        this.debug({
          visibleIds,
          notAddedYet: notAddedYet.length,
        });

        if (notAddedYet.length > 0) {
          this.visibleNotifications.push(notAddedYet[0]);
        }
      }

      this.updateAllowedToFillAgain();
    },
    async triggerFillUntilFull () {
      for (let i = 0; i < NOTIFICATIONS_VISIBLE_AT_ONCE; i += 1) {
        this.debug(`fill ${i}`);
        this.fillVisibleNotifications(this.notificationStore);

        await sleepAsync(DELAY_FILLING_ENTRIES); // eslint-disable-line no-await-in-loop
      }
    },
    triggerRemovalTimerIfAllowed () {
      // this is only for storybook
      if (this.preventQueue) {
        return;
      }

      if (this.notificationStore.length !== 0) {
        this.startNotificationRemovalTimer();
      }
    },
    startNotificationRemovalTimer () {
      if (this.removalIntervalId != null) {
        // current interval still running - wait until its done
        return;
      }

      this.debug('start removal interval');
      this.removalIntervalId = setInterval(() => {
        const nonErrorNotifications = this.visibleNotifications.filter(n => n.type !== 'error');

        if (nonErrorNotifications.length !== 0) {
          const firstEntry = nonErrorNotifications[0];

          this.debug('removed entry', firstEntry);
          this.notificationRemoved(firstEntry);
        }

        if (nonErrorNotifications.length === 0) {
          this.stopNotificationsRemovalTimer();

          this.updateAllowedToFillAgain();
        }
      }, REMOVAL_INTERVAL);
    },

    stopNotificationsRemovalTimer () {
      if (this.removalIntervalId == null) {
        // current interval still running - wait until its done
        return;
      }

      this.debug('clear removal interval');
      clearInterval(this.removalIntervalId);
      this.removalIntervalId = null;
    },

    updateAllowedToFillAgain () {
      const notificationsAmount = this.visibleNotificationsWithoutErrors.length;
      this.allowedToFillAgain = notificationsAmount < NOTIFICATIONS_VISIBLE_AT_ONCE;

      this.debug({
        allowedToFillAgain: this.allowedToFillAgain,
      });
    },

    /**
     * This updates the position of all notifications so that its always at the top,
     * unless the header is visible then its under the header
     */
    updateScrollY () {
      const topY = Math.min(window.scrollY, this.notificationBannerHeight) - 10;

      this.notificationTopY = `${this.notificationBannerHeight - topY}px`;
    },
  },
};
</script>
