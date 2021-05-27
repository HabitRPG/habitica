<template>
  <div
    class="notifications"
    :class="notificationsTopPos"
  >
    <notification v-for="notification in visibleNotifications"
                  :key="notification.uuid"
                  :notification="notification"
                  :visibleAmount="visibleNotifications.length"
                  @hidden="notificationRemoved($event)" />
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
</style>

<script>
import { mapState } from '@/libs/store';
import notification from './notification';

const amountOfVisisbleNotifications = 2;
const timeoutBetweenVisibleNotifications = 1500;

export default {
  data () {
    return {
      visibleNotifications: [],
      allowedToFillAgain: true,
      allowedToTriggerImmediately: true,
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

      this.allowedToFillAgain = this.visibleNotifications.length === 0;
      this.$store.dispatch('snackbars:remove', $event);

      if (this.allowedToFillAgain) {
        // reset the flag so that the next call (for a new notification) will be immediately
        if (this.notificationStore.length === 0) {
          this.allowedToTriggerImmediately = true;
        } else {
          setTimeout(() => {
            this.fillVisibleNotifications(this.notificationStore);
          }, timeoutBetweenVisibleNotifications);
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
      while (this.visibleNotifications.length < amountOfVisisbleNotifications) {
        const visibleIds = this.visibleNotifications.map(n => n.uuid);

        const notAddedYet = notifications.filter(n => !visibleIds.includes(n.uuid));

        if (notAddedYet.length > 0) {
          this.visibleNotifications.push(notAddedYet[0]);
        } else {
          break;
        }
      }

      this.allowedToFillAgain = this.visibleNotifications.length !== amountOfVisisbleNotifications;
    },
  },
  watch: {
    notificationStore (notifications) {
      // to fill it the first time or once the range of notifications are done
      if (this.allowedToTriggerImmediately) {
        setTimeout(() => {
          this.fillVisibleNotifications(notifications);
        }, 250); // to wait for additional notifications to fill up
        this.allowedToTriggerImmediately = false;
      }
    },
  },
};
</script>
