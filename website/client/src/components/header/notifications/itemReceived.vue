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
    >
      <strong> {{ notification.data.title }} </strong>
      <span> {{ notification.data.text }} </span>
    </div>
    <div
      slot="icon"
      class="mt-3"
      :class="notification.data.icon"
    ></div>
  </base-notification>
</template>

<script>
import BaseNotification from './base';

export default {
  components: {
    BaseNotification,
  },
  props: {
    notification: {
      type: Object,
      default (data) {
        return data;
      },
    },
    canRemove: {
      type: Boolean,
      default: true,
    },
  },
  methods: {
    action () {
      if (!this.notification || !this.notification.data) {
        return;
      }
      if (this.notification.data.destination === 'backgrounds') {
        this.$store.state.avatarEditorOptions.editingUser = true;
        this.$store.state.avatarEditorOptions.startingPage = 'backgrounds';
        this.$store.state.avatarEditorOptions.subpage = '2023';
        this.$root.$emit('bv::show::modal', 'avatar-modal');
      } else {
        this.$router.push({ name: this.notification.data.destination || 'items' });
      }
    },
  },
};
</script>
