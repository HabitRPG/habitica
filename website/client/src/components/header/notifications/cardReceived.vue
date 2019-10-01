<template lang="pug">
base-notification(
  :can-remove="canRemove",
  :has-icon="true",
  :notification="notification",
  :read-after-click="true",
  @click="action"
)
  div(slot="content", v-html="$t('cardReceived', {card: cardString})")
  div(slot="icon", :class="cardClass")
</template>

<script>
import BaseNotification from './base';

export default {
  props: ['notification', 'canRemove'],
  components: {
    BaseNotification,
  },
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
      this.$router.push({name: 'items'});
    },
  },
};
</script>