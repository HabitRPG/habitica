<template lang="pug">
base-notification(
  :can-remove="canRemove",
  :has-icon="false",
  :notification="notification",
  @click="action"
)
  div(slot="content", v-html="$t('newMsg', {name: notification.data.name})")
</template>

<script>
import BaseNotification from './base';

export default {
  props: ['notification', 'canRemove'],
  components: {
    BaseNotification,
  },
  methods: {
    action () {
      const groupId = this.notification.data.groupId;

      if (groupId === this.user.party._id) {
        this.$router.push({ name: 'party' });
        return;
      }

      this.$router.push({ name: 'guild', params: { groupId }});
    },
  },
};
</script>