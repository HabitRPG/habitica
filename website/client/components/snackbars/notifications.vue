<template lang="pug">
.notifications(:class="notificationsTopPos")
  div(v-for='notification in notificationStore', :key='notification.uuid')
    notification(:notification='notification')
</template>

<style lang="scss" scoped>
  .notifications {
    position: fixed;
    right: 10px;
    width: 350px;
    z-index: 1400; // 1400 is above modal backgrounds

    &-top-pos {
      &-double {
        top: 145px;
      }

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
import { mapState } from 'client/libs/store';
import notification from './notification';
import { CONSTANTS, getLocalSetting } from 'client/libs/userlocalManager';

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
      if (this.userSleeping && this.giftingShown) {
        modifier = 'double';
      } else if (this.userSleeping || this.giftingShown) {
        modifier = 'sleeping';
      } else {
        modifier = 'normal';
      }
      return `${base}${modifier}`;
    },
  },
  data () {
    return {
      giftingShown: getLocalSetting(CONSTANTS.keyConstants.GIFTING_BANNER_DISPLAY) !== 'dismissed',
    };
  },
};
</script>
