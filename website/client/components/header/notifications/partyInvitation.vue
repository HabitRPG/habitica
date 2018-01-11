<template lang="pug">
base-notification(
  :can-remove="canRemove",
  :has-icon="false",
  :notification="notification",
)
  div(slot="content")
    div(v-html="$t('invitedToParty', {party: notification.data.name})")
    .notifications-buttons
      .btn.btn-small.btn-success(@click.stop="") {{ $t('accept') }}
      .btn.btn-small.btn-danger(@click.stop="") {{ $t('reject') }}
</template>

<script>
import BaseNotification from './base';
import * as Analytics from 'client/libs/analytics';
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

      // @TODO mutation to store data should only happen through actions
      this.user.invitations.parties.splice(index, 1);

      Analytics.updateUser({partyID: group.id});
     
      this.user.party._id = group.id;
      this.$router.push('/party');

      // @TODO: check for party , type: 'myGuilds'
      await this.$store.dispatch('guilds:join', {guildId: group.id});
    },
    async reject () {
      await this.$store.dispatch('guilds:rejectInvite', {groupId: this.notification.data.id});
      // @TODO: User.sync();
    },
  },
};
</script>