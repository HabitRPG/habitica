<template lang="pug">
base-notification(
  :can-remove="canRemove",
  :has-icon="false",
  :notification="notification",
)
  div(slot="content")
    div(v-html="$t('invitedToParty', {party: notification.data.name})")
    .notifications-buttons
      .btn.btn-small.btn-success(@click.stop="accept()") {{ $t('accept') }}
      .btn.btn-small.btn-danger(@click.stop="reject()") {{ $t('reject') }}
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
    async accept () {
      const group = this.notification.data;

      if (group.cancelledPlan && !confirm(this.$t('aboutToJoinCancelledGroupPlan'))) {
        return;
      }

      await this.$store.dispatch('guilds:join', {groupId: group.id, type: 'party'});
      this.$router.push('/party');
    },
    reject () {
      this.$store.dispatch('guilds:rejectInvite', {groupId: this.notification.data.id, type: 'party'});
    },
  },
};
</script>