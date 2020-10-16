<template>
  <base-notification
    :can-remove="canRemove"
    :has-icon="false"
    :notification="notification"
    :read-after-click="true"
    @click="action"
  >
    <div
      slot="content"
      class="notification-bold-blue"
    >
      {{ $t('dropCapReached') }}
    </div>
  </base-notification>
</template>

<script>
import BaseNotification from './base';
import * as Analytics from '@/libs/analytics';

export default {
  components: {
    BaseNotification,
  },
  props: {
    notification: { type: Object, required: true },
    canRemove: { type: Boolean, required: true },
  },
  methods: {
    action () {
      this.$root.$emit('habitica:drop-cap-reached', this.notification);

      Analytics.track({
        hitType: 'event',
        eventCategory: 'drop-cap-reached',
        eventAction: 'click',
        eventLabel: 'Drop Cap Reached > Notification Click',
      });
    },
  },
};
</script>
