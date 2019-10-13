<template>
  <base-notification
    :can-remove="canRemove"
    :has-icon="false"
    :notification="notification"
  >
    <div slot="content">
      <div v-html="$t('invitedToParty', {party: notification.data.name})"></div>
      <div class="notifications-buttons">
        <div
          class="btn btn-small btn-success"
          @click.stop="accept()"
        >
          {{ $t('accept') }}
        </div>
        <div
          class="btn btn-small btn-danger"
          @click.stop="reject()"
        >
          {{ $t('reject') }}
        </div>
      </div>
    </div>
  </base-notification>
</template>

<script>
import BaseNotification from './base';
import { mapState } from '@/libs/store';

export default {
  components: {
    BaseNotification,
  },
  props: ['notification', 'canRemove'],
  computed: {
    ...mapState({ user: 'user.data' }),
  },
  methods: {
    async accept () {
      const group = this.notification.data;

      if (group.cancelledPlan && !window.confirm(this.$t('aboutToJoinCancelledGroupPlan'))) {
        return;
      }

      await this.$store.dispatch('guilds:join', { groupId: group.id, type: 'party' });
      this.$router.push('/party');
    },
    reject () {
      this.$store.dispatch('guilds:rejectInvite', { groupId: this.notification.data.id, type: 'party' });
    },
  },
};
</script>
