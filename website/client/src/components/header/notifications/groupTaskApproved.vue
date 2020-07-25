<template>
  <base-notification
    :can-remove="false"
    :has-icon="false"
    :notification="notification"
    :read-after-click="true"
    @click="action"
  >
    <div slot="content">
      <div
        class="notification-green"
        v-html="notification.data.message"
      ></div>
      <div class="notifications-buttons">
        <div
          class="btn btn-small btn-primary"
          @click.stop="action()"
        >
          {{ $t('claimRewards') }}
        </div>
      </div>
    </div>
  </base-notification>
</template>

<script>
import BaseNotification from './base';
import scoreTask from '@/mixins/scoreTask';
import sync from '@/mixins/sync';

export default {
  components: {
    BaseNotification,
  },
  mixins: [scoreTask, sync],
  props: ['notification', 'canRemove'],
  methods: {
    async action () {
      const { task, direction } = this.notification.data;
      await this.taskScore(task, direction);
      this.sync();
    },
  },
};
</script>
