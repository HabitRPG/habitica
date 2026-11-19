<template>
  <base-notification
    :can-remove="canRemove"
    :has-icon="false"
    :notification="notification"
    :read-after-click="true"
    @click="action"
  >
    <div
      slot="content"
      v-html="notification.data.message"
    ></div>
  </base-notification>
</template>

<script>
import BaseNotification from './base';

export default {
  components: {
    BaseNotification,
  },
  props: {
    notification: {
      type: Object,
      required: true,
    },
    canRemove: {
      type: Boolean,
      default: false,
    },
  },
  methods: {
    action () {
      if (this.notification.data.groupId) {
        this.$router.push({
          name: 'groupPlanDetailTaskInformation',
          params: { groupId: this.notification.data.groupId },
        });
      } else {
        this.$router.push({ name: 'tasks' });
      }
    },
  },
};
</script>
