<template lang="pug">
base-notification(
  :can-remove="canRemove",
  :has-icon="false",
  :notification="notification",
  :read-after-click="true",
  @click="action",
)
  .notification-yellow(slot="content", v-html="notification.data.message")
</template>

<script>
import BaseNotification from './base';

export default {
  components: {
    BaseNotification,
  },
  props: ['notification', 'canRemove'],
  methods: {
    action () {
      const groupId = this.notification.data.group.id;
      this.$router.push({ name: 'groupPlanDetailTaskInformation', params: { groupId } });
    },
  },
};
</script>
