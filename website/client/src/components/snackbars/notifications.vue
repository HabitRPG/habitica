<template>
  <div class="notifications"
       :class="notificationsTopPos">
    <transition-group name="notifications"
                      class="animations-holder"
                      appear>
      <notification v-for="(notification, index) in visibleNotifications"
                    v-bind:key="notification.uuid"
                    :notification="notification"
                    class="notification-item"
                    :visibleAmount="index"
                    @clicked="notificationRemoved(notification)"
                    @hidden="notificationRemoved($event)" />
    </transition-group>
  </div>
</template>

<style lang="scss" scoped>
  .notifications {
    position: fixed;
    right: 10px;
    width: 350px;
    z-index: 1400; // 1400 is above modal backgrounds

    &-top-pos {
      &-normal {
        top: 65px;
      }

      &-sleeping {
        top: 105px;
      }
    }
  }

  .animations-holder {
    position: relative;
    display: block;
  }

  .notification-item {
    transition: transform 0.5s, opacity 0.5s;
  }

  .notifications-move {
    // transition: transform .5s;
  }

  .notifications-enter-active {
    // transition: opacity .5s;
  }

  .notifications-leave-active {
    position: absolute;
  }

  .notifications-enter,
  .notifications-leave-to {
    opacity: 0;
    transform: translateY(0);
  }
</style>

<script>
import { mapState } from '@/libs/store';
import notification from './notification';

const amountOfVisisbleNotifications = 2;
const delayBetweenDeletionAndNew = 1000;
const removalInterval = 2500;

export default {
  props: ['preventQueue'],
  data () {
    return {
      visibleNotifications: [],
      allowedToFillAgain: true,
      allowedToTriggerImmediately: true,
      removalIntervalId: null,
    };
  },
  components: {
    notification,
  },
  computed: {
    ...mapState({
      notificationStore: 'notificationStore',
      userSleeping: 'user.data.preferences.sleep',
    }),
    notificationsTopPos () {
      const base = 'notifications-top-pos-';
      let modifier = '';
      if (this.userSleeping) {
        modifier = 'sleeping';
      } else {
        modifier = 'normal';
      }
      return `${base}${modifier}`;
    },
  },
  methods: {
    notificationRemoved ($event) {
      // findIndex+splice is the way to go on removing, instead of .filter
      // due to the way vue handles new arrays / entries even if you use :key="uuid"
      // the notification object was replaced and prevented to stop the right timer => to remove it
      const foundNotification = this.visibleNotifications.findIndex(n => n.uuid === $event.uuid);

      this.visibleNotifications.splice(foundNotification, 1);

      this.allowedToFillAgain = this.visibleNotifications.length < amountOfVisisbleNotifications;
      this.$store.dispatch('snackbars:remove', $event);

      if (this.allowedToFillAgain) {
        // reset the flag so that the next call (for a new notification) will be immediately
        if (this.notificationStore.length === 0) {
          this.allowedToTriggerImmediately = true;
        } else {
          setTimeout(() => {
            this.fillVisibleNotifications(this.notificationStore);
          }, delayBetweenDeletionAndNew);
        }
      }
    },
    fillVisibleNotifications (notifications) {
      // if there are currently no notifications anymore in the store
      // and none visible - re-enable allowedToTriggerImmediately
      if (notifications.length === 0 && this.allowedToFillAgain
          && this.visibleNotifications.length === 0) {
        this.allowedToTriggerImmediately = true;

        return;
      }

      // the generic checks - new notification array has enough items
      // is allowed to be filled and don't do anything while the visible items are 2
      if (notifications.length === 0 || !this.allowedToFillAgain
          || this.visibleNotifications.length === amountOfVisisbleNotifications) {
        return;
      }

      // this checks if the visible items are the current ones in the notifications array
      // if so - there is no need to continue, for example on only one visible notification,
      // it doesn't need to go with the loop again
      if (notifications.length === this.visibleNotifications.length) {
        const visibleIds = this.visibleNotifications.map(n => n.uuid);

        const allTheSame = notifications.every(n => visibleIds.includes(n.uuid));

        if (allTheSame) {
          return;
        }
      }

      // fill the new items that needs to be visible
      if (this.visibleNotifications.length < amountOfVisisbleNotifications) {
        const visibleIds = this.visibleNotifications.map(n => n.uuid);

        const notAddedYet = notifications.filter(n => !visibleIds.includes(n.uuid));

        if (notAddedYet.length > 0) {
          this.visibleNotifications.push(notAddedYet[0]);
        }
      }

      this.allowedToFillAgain = this.visibleNotifications.length < amountOfVisisbleNotifications;
    },
    startNotificationRemovalTimer () {
      if (this.removalIntervalId != null) {
        // current interval still running - wait until its done
        return;
      }

      this.removalIntervalId = setInterval(() => {
        if (this.visibleNotifications.length !== 0) {
          const firstEntry = this.visibleNotifications[0];

          this.notificationRemoved(firstEntry);
        }

        if (this.visibleNotifications.length === 0) {
          clearInterval(this.removalIntervalId);
          this.removalIntervalId = null;
        }
      }, removalInterval);
    },
  },
  watch: {
    notificationStore (notifications) {
      // to fill it the first time or once the range of notifications are done
      if (this.allowedToTriggerImmediately) {
        // first notification
        setTimeout(() => {
          this.fillVisibleNotifications(notifications);

          // 2nd needs to be added at a later time
          setTimeout(() => {
            this.fillVisibleNotifications(this.notificationStore);
          }, 500);
        }, 250); // to wait for additional notifications to fill up


        this.allowedToTriggerImmediately = false;

        // this is only for storybook
        if (this.preventQueue) {
          return;
        }

        if (this.notificationStore.length !== 0) {
          this.startNotificationRemovalTimer();
        }
      }
    },
  },
};
</script>
