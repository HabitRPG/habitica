<template lang="pug">
.notifications
  div(v-for='notification in notifications')
    notification(:notification='notification')
</template>

<style lang="scss" scoped>
  .notifications {
    position: fixed;
    right: 10px;
    top: 10px;
    width: 350px;
    z-index: 99999;
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
