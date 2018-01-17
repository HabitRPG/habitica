<template lang="pug">
.notifications
  div(v-for='notification in notifications', :key='notification.uuid')
    notification(:notification='notification')
</template>

<style lang="scss" scoped>
  .notifications {
    position: fixed;
    right: 10px;
    top: 65px;
    width: 350px;
    z-index: 1041; // 1041 is above modal backgrounds
  }
</style>

<script>
import notification from './notification';

export default {
  components: {
    notification,
  },
  computed: {
    notifications () {
      return this.$store.state.notificationStore;
    },
  },
};
</script>
