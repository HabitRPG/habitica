<template lang="pug">
base-notification(
  :can-remove="canRemove",
  :has-icon="true",
  :notification="notification",
  @click="action"
)
  div(slot="content", v-html="$t('newSubscriberItem')")
  div(slot="icon", :class="mysteryClass")
</template>

<script>
import BaseNotification from './base';
import moment from 'moment';

export default {
  props: ['notification', 'canRemove'],
  components: {
    BaseNotification,
  },
  computed: {
    mysteryClass () {
      return `notif_inventory_present_${moment().format('MM')}`;
    },
  },
  methods: {
    action () {
      this.$router.push('inventory/items');
    },
  },
};
</script>