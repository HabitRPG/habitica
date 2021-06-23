<template>
  <base-notification
    :can-remove="canRemove"
    :has-icon="true"
    :notification="notification"
    :read-after-click="true"
    @click="action"
  >
    <div slot="content">
      <div class="notification-bold-purple">
        {{ $t('newBaileyUpdate') }}
      </div>
      <div>{{ notification.data.title }}</div>
    </div>
    <div
      slot="icon"
      :class="npcClass('bailey')"
    ></div>
  </base-notification>
</template>

<script>
import BaseNotification from './base';
import seasonalNPC from '@/mixins/seasonalNPC';

export default {
  components: {
    BaseNotification,
  },
  mixins: [seasonalNPC],
  props: ['notification', 'canRemove'],
  methods: {
    action () {
      this.$root.$emit('bv::show::modal', 'new-stuff');
    },
  },
};
</script>
