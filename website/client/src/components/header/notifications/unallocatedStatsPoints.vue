<template>
  <base-notification
    :can-remove="canRemove"
    :has-icon="true"
    :notification="notification"
    :read-after-click="true"
    @click="action"
  >
    <div
      slot="content"
      v-html="$t('unallocatedStatsPoints', {points: notification.data.points})"
    ></div>
    <div
      slot="icon"
      class="svg-icon"
      v-html="icons.sparkles"
    ></div>
  </base-notification>
</template>

<style lang="scss" scoped>
.svg-icon {
  width: 23px;
  height: 28px;
}
</style>

<script>
import BaseNotification from './base';
import sparklesIcon from '@/assets/svg/sparkles.svg';

export default {
  components: {
    BaseNotification,
  },
  props: ['notification', 'canRemove'],
  data () {
    return {
      icons: Object.freeze({
        sparkles: sparklesIcon,
      }),
    };
  },
  methods: {
    action () {
      this.$router.push({ name: 'stats' });
    },
  },
};
</script>
