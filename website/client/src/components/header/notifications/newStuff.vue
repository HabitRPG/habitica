<template lang="pug">
base-notification(
  :can-remove="canRemove",
  :has-icon="true",
  :notification="notification",
  :read-after-click="true",
  @click="action"
)
  div(slot="content")
    .notification-bold-purple {{ $t('newBaileyUpdate') }}
    div {{ notification.data.title }}
  .npc_bailey(slot="icon")
</template>

<script>
import BaseNotification from './base';

export default {
  props: ['notification', 'canRemove'],
  components: {
    BaseNotification,
  },
  methods: {
    action () {
      this.$root.$emit('bv::show::modal', 'new-stuff');
    },
  },
};
</script>