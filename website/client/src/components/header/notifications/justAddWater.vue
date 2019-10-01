<template lang="pug">
  base-notification(
    :can-remove="canRemove",
    :notification="notification",
    :read-after-click="true",
    @click="action"
  )
    div(slot="content", v-html="achievementString")
</template>

<script>
  import BaseNotification from './base';

  export default {
    props: ['notification', 'canRemove'],
    components: {
      BaseNotification,
    },
    computed: {
      achievementString () {
        return `<strong>${this.$t('achievement')}</strong>: ${this.$t('achievementJustAddWater')}`;
      },
    },
    methods: {
      action () {
        this.$root.$emit('bv::show::modal', 'just-add-water');
      },
    },
  };
</script>
