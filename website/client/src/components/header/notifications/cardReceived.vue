<template>
  <base-notification
    :can-remove="canRemove"
    :has-icon="true"
    :notification="notification"
    :read-after-click="false"
    @click="action"
  >
    <div
      slot="content"
      v-html="$t('cardReceived', {card: cardString})"
    ></div>
    <div
      slot="icon"
      :class="cardClass"
    ></div>
  </base-notification>
</template>

<script>
import BaseNotification from './base';

export default {
  components: {
    BaseNotification,
  },
  props: ['notification', 'canRemove'],
  computed: {
    cardString () {
      return this.$t(`${this.notification.data.card}Card`);
    },
    cardClass () {
      return `notif_inventory_special_${this.notification.data.card}`;
    },
  },
  methods: {
    action () {
      this.$router.push({ name: 'items' });
    },
  },
};
</script>
