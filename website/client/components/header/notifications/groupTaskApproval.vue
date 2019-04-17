<template lang="pug">
base-notification(
  :can-remove="canRemove",
  :has-icon="false",
  :notification="notification",
  @click="action",
)
  div(slot="content")
    div(v-html="notification.data.message")
    .notifications-buttons
      .btn.btn-small.btn-success(@click.stop="approve()") {{ $t('approve') }}
      .btn.btn-small.btn-warning(@click.stop="needsWork()") {{ $t('needsWork') }}
</template>

<script>
import BaseNotification from './base';
import { mapState } from 'client/libs/store';
import sync from 'client/mixins/sync';

export default {
  mixins: [sync],
  props: ['notification', 'canRemove'],
  components: {
    BaseNotification,
  },
  computed: {
    ...mapState({user: 'user.data'}),
    // Check that the notification has all the necessary data (old ones are missing some fields)
    notificationHasData () {
      return Boolean(this.notification.data.groupTaskId && this.notification.data.userId);
    },
  },
  methods: {
    action () {
      const groupId = this.notification.data.group.id;
      this.$router.push({ name: 'groupPlanDetailTaskInformation', params: { groupId }});
    },
    async approve () {
      // Redirect users to the group tasks page if the notification doesn't have data
      if (!this.notificationHasData) {
        this.$router.push({ name: 'groupPlanDetailTaskInformation', params: {
          groupId: this.notification.data.groupId,
        }});

        return;
      }

      await this.$store.dispatch('tasks:approve', {
        taskId: this.notification.data.groupTaskId,
        userId: this.notification.data.userId,
      });

      this.sync();
    },
    async needsWork () {
      // Redirect users to the group tasks page if the notification doesn't have data
      if (!this.notificationHasData) {
        this.$router.push({ name: 'groupPlanDetailTaskInformation', params: {
          groupId: this.notification.data.groupId,
        }});

        return;
      }

      if (!confirm(this.$t('confirmNeedsWork'))) return;

      await this.$store.dispatch('tasks:needsWork', {
        taskId: this.notification.data.groupTaskId,
        userId: this.notification.data.userId,
      });

      this.sync();
    },
  },
};
</script>
