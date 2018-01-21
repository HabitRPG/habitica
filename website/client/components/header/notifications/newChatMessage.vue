<template lang="pug">
// Read automatically from the group page mounted hook
base-notification(
  :can-remove="canRemove",
  :has-icon="false",
  :notification="notification",
  :read-after-click="false",
  @click="action"
)
  div(slot="content", v-html="string")
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
    groupId () {
      return this.notification.data.group.id;
    },
    isParty () {
      return this.groupId === this.user.party._id;
    },
    string () {
      const stringKey = this.isParty ? 'newMsgParty' : 'newMsgGuild';
      return this.$t(stringKey, {name: this.notification.data.group.name});
    },
  },
  methods: {
    action () {
      if (this.isParty) {
        this.$router.push({ name: 'party' });
        return;
      }

      this.$router.push({ name: 'guild', params: { groupId: this.groupId }});
    },
  },
};
</script>