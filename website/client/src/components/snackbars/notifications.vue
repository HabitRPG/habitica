<template>
  <div
    class="notifications"
    :class="notificationsTopPos"
  >
    <div
      v-for="notification in visibleNotifications"
      :key="notification.uuid"
    >
      <notification :notification="notification"
                    :visibleAmount="visibleNotifications.length"
                    @hidden="notificationRemoved($event)" />
    </div>
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

export default {
  data () {
    return {
      visibleNotifications: [],
      allowedToFillAgain: true,
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
      this.visibleNotifications = this.visibleNotifications.filter(n => n.uuid === $event.uuid);
      console.info('notification removed', $event.uuid);

      this.allowedToFillAgain = this.visibleNotifications.length === 0;
      // this.$store.dispatch('snackbars:remove', $event);
    },
    fillVisibleNotifications (notifications) {
      // the generic checks - new notification array has enough items
      // is allowed to be filled and don't do anything while the visible items are 2
      if (notifications.length === 0 || !this.allowedToFillAgain
          || this.visibleNotifications.length === 2) {
        return;
      }

      console.info({
        notifications,
        allowedToFillAgain: this.allowedToFillAgain,
        visibleNotifications: this.visibleNotifications,
      });

      // this checks if the visible items are the current ones in the notifications array
      // if so - there is no need to continue, for example on only one visible notification,
      // it doesn't need to go with the loop again
      if (notifications.length === this.visibleNotifications.length) {
        const visibleIds = this.visibleNotifications.map(n => n.uuid);

        const allTheSame = notifications.every(n => visibleIds.includes(n.uuid));

        if (allTheSame) {
          console.warn('all the same, stopping here');
          return;
        }
      }

      // fill the new items that needs to be visible
      while (this.visibleNotifications.length < 2) {
        const visibleIds = this.visibleNotifications.map(n => n.uuid);

        const notAddedYet = notifications.filter(n => !visibleIds.includes(n.uuid));

        if (notAddedYet.length > 0) {
          this.visibleNotifications.push(notAddedYet[0]);
        } else {
          break;
        }
      }

      this.allowedToFillAgain = this.visibleNotifications.length !== 2;
    },
  },
  watch: {
    notificationStore (notifications) {
      this.fillVisibleNotifications(notifications);
    },
  },
};
</script>
