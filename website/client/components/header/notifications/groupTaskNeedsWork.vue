<template lang="pug">
base-notification(
  :can-remove="canRemove",
  :has-icon="false",
  :notification="notification",
  @click="action"
)
  .notification-yellow(slot="content", v-html="notificationString")
</template>

<script>
import BaseNotification from './base';

export default {
  props: ['notification', 'canRemove'],
  components: {
    BaseNotification,
  },
  computed: {
    notificationString () {
      const taskText = this.notification.data.task.text;
      const managerName = this.notification.data.manager.name;

      return this.$t('taskNeedsWork', {taskText, managerName});
    }
  },
  methods: {
    action () {
      const groupId = this.notification.data.groupId;
      this.$router.push({ name: 'groupPlanDetailTaskInformation', params: { groupId }});
    },
  },
};
</script>