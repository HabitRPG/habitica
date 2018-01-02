<template lang="pug">
base-notification(
  :can-remove="canRemove",
  :has-icon="true",
  :notification="notification",
  @click="action"
)
  div(slot="content", v-html="$t('cardReceived', {card: cardString})")
  .svg-icon(slot="icon", v-html="icons.card")
</template>

<style lang="scss" scoped>
.svg-icon {
  width: 28px;
  height: 28px;
}
</style>

<script>
import BaseNotification from './base';
import cardIcon from 'assets/svg/sparkles.svg';

export default {
  props: ['notification', 'canRemove'],
  components: {
    BaseNotification,
  },
  data () {
    return {
      icons: Object.freeze({
        mysteryItems: cardIcon,
      }),
    };
  },
  computed: {
    cardString () {
      return `${this.notification.data.card}Card`;
    },
  },
  methods: {
    action () {
      this.$router.push('inventory/items');
    },
  },
};
</script>