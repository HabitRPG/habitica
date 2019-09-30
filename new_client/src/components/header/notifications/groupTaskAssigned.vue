<template lang="pug">
  base-notification(
    :can-remove="canRemove",
    :has-icon="false",
    :notification="notification",
    :read-after-click="true",
    @click="action",
  )
    div(slot="content", v-html="notification.data.message")
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
        this.$router.push({ name: 'tasks'});
      },
    },
  };
</script>
