<template lang="pug">
base-notification(
  :can-remove="canRemove",
  :has-icon="true",
  :notification="notification",
  @click="action"
)
  div(slot="content", v-html="$t('newSubscriberItem')")
  .svg-icon(slot="icon", v-html="icons.mysteryItems")
</template>

<style lang="scss" scoped>
.svg-icon {
  width: 28px;
  height: 28px;
}
</style>

<script>
import BaseNotification from './base';
import mysteryItemsIcon from 'assets/svg/sparkles.svg';

export default {
  props: ['notification', 'canRemove'],
  data () {
    return {
      icons: Object.freeze({
        mysteryItems: mysteryItemsIcon,
      }),
    };
  },
  components: {
    BaseNotification,
  },
  methods: {
    action () {
      this.$router.push('inventory/items');
    },
  },
};
</script>