<template>
  <div
    class="notifications"
    :class="notificationsTopPos"
  >
    <div
      v-for="notification in notificationStore"
      :key="notification.uuid"
    >
      <notification :notification="notification" />
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
};
</script>
