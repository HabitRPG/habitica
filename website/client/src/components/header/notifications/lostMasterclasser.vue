<template>
  <base-notification
    :can-remove="canRemove"
    :notification="notification"
    :read-after-click="true"
    @click="action"
  >
    <div
      slot="content"
      v-html="achievementString"
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
    achievementString () {
      return `<strong>${this.$t('achievement')}</strong>: ${this.$t('achievementLostMasterclasser')}`;
    },
  },
  methods: {
    action () {
      this.$root.$emit('bv::show::modal', 'lost-masterclasser');
    },
  },
};
</script>
