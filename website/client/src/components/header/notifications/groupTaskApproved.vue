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

export default {
  components: {
    BaseNotification,
  },
  props: ['notification', 'canRemove'],
  mixins: [scoreTask],
  methods: {
    action () {
      const { task, direction } = this.notification.data;
      this.taskScore(task, direction);
    },
  },
};
</script>
