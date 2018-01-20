<template lang="pug">
// Read automatically from the group page mounted hook
base-notification(
  :can-remove="canRemove",
  :has-icon="false",
  :notification="notification",
  :read-after-click="false",
  @click="action"
)
  div(slot="content", v-html="$t('newMsg', {name: notification.data.group.name})")
</template>

<script>
import BaseNotification from './base';
import { mapState } from 'client/libs/store';

export default {
  props: ['notification', 'canRemove'],
  components: {
    BaseNotification,
  },
  computed: {
    ...mapState({user: 'user.data'}),
  },
  methods: {
    action () {
      const groupId = this.notification.data.group.id;

      if (groupId === this.user.party._id) {
        this.$router.push({ name: 'party' });
        return;
      }

      this.$router.push({ name: 'guild', params: { groupId }});
    },
  },
};
</script>