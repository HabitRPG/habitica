<template lang="pug">
base-notification(
  :can-remove="canRemove",
  :has-icon="false",
  :notification="notification",
)
  div(slot="content")
    div(v-html="$t('invitedToGuild', {guild: notification.data.name})")
    .notifications-buttons
      .btn.btn-small.btn-success(@click.stop="accept") {{ $t('accept') }}
      .btn.btn-small.btn-danger(@click.stop="reject") {{ $t('reject') }}
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
    async accept (group, index, type) {
      const group = this.notification.data;

      if (group.cancelledPlan && !confirm(this.$t('aboutToJoinCancelledGroupPlan'))) {
        return;
      }

      this.user.invitations.guilds.splice(index, 1);

      this.user.guilds.push(group.id);
      this.$router.push(`/groups/guild/${group.id}`);

      // @TODO: check for party , type: 'myGuilds'
      await this.$store.dispatch('guilds:join', {guildId: group.id});
    },
    async reject (group) {
      await this.$store.dispatch('guilds:rejectInvite', {groupId: this.notification.data.id});
      // @TODO: User.sync();
    },

  },
};
</script>