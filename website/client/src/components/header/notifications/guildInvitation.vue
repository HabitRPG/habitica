<template>
  <base-notification
    :can-remove="canRemove"
    :has-icon="false"
    :notification="notification"
    @click="action"
  >
    <div slot="content">
      <div v-html="textString"></div>
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
    isPublicGuild () {
      if (this.notification.data.publicGuild === true) return true;
      return false;
    },
    textString () {
      const guild = this.notification.data.name;

      if (this.isPublicGuild) {
        return this.$t('invitedToPublicGuild', { guild });
      }
      return this.$t('invitedToPrivateGuild', { guild });
    },
  },
  methods: {
    action () {
      if (!this.isPublicGuild) return;

      const groupId = this.notification.data.id;

      this.$router.push({ name: 'guild', params: { groupId } });
    },
    async accept () {
      const group = this.notification.data;

      if (group.cancelledPlan && !window.confirm(this.$t('aboutToJoinCancelledGroupPlan'))) { // eslint-disable-line no-alert
        return;
      }

      await this.$store.dispatch('guilds:join', { groupId: group.id, type: 'guild' });
      this.$router.push({ name: 'guild', params: { groupId: group.id } });
    },
    reject () {
      this.$store.dispatch('guilds:rejectInvite', { groupId: this.notification.data.id, type: 'guild' });
    },

  },
};
</script>
