<template>
  <base-notification
    :can-remove="false"
    :has-icon="false"
    :notification="notification"
    @click="action"
  >
    <div slot="content">
      <div v-html="notification.data.message"></div>
      <div class="notifications-buttons">
        <div
          class="btn btn-small btn-success mr-2"
          @click.stop="approve()"
        >
          {{ $t('approve') }}
        </div>
        <div
          class="btn btn-small btn-secondary"
          @click.stop="needsWork()"
        >
          {{ $t('needsWork') }}
        </div>
      </div>
    </div>
  </base-notification>
</template>

<script>
import BaseNotification from './base';
import { mapState } from '@/libs/store';
import sync from '@/mixins/sync';

export default {
  components: {
    BaseNotification,
  },
  mixins: [sync],
  props: ['notification', 'canRemove'],
  computed: {
    ...mapState({ user: 'user.data' }),
    // Check that the notification has all the necessary data (old ones are missing some fields)
    notificationHasData () {
      return Boolean(this.notification.data.groupTaskId && this.notification.data.userId);
    },
  },
  methods: {
    action () {
      this.$router.push({ name: 'groupPlanDetailTaskInformation', params: { groupId: this.notification.data.groupId } });
    },
    async approve () {
      // Redirect users to the group tasks page if the notification doesn't have data
      if (!this.notificationHasData) {
        this.$router.push({
          name: 'groupPlanDetailTaskInformation',
          params: {
            groupId: this.notification.data.groupId,
          },
        });

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
        this.$router.push({
          name: 'groupPlanDetailTaskInformation',
          params: {
            groupId: this.notification.data.groupId,
          },
        });

        return;
      }

      if (!window.confirm(this.$t('confirmNeedsWork'))) return; // eslint-disable-line no-alert

      await this.$store.dispatch('tasks:needsWork', {
        taskId: this.notification.data.groupTaskId,
        userId: this.notification.data.userId,
      });

      this.sync();
    },
  },
};
</script>
