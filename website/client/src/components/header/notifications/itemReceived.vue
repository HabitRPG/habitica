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
    <Sprite
      slot="icon"
      class="mt-3"
      :image-name="notification.data.icon"
    />
  </base-notification>
</template>

<script>
import BaseNotification from './base';
import Sprite from '@/components/ui/sprite.vue';

export default {
  components: {
    BaseNotification,
    Sprite,
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
      if (!this.notification || !this.notification.data
        || this.notification.data.destination === this.$route.path) {
        return;
      }
      if (this.notification.data.destination.indexOf('backgrounds') !== -1) {
        this.$store.state.avatarEditorOptions.editingUser = true;
        this.$store.state.avatarEditorOptions.startingPage = 'backgrounds';
        this.$store.state.avatarEditorOptions.subpage = '2024';
        this.$root.$emit('bv::show::modal', 'avatar-modal');
      } else {
        this.$router.push(this.notification.data.destination || '/inventory/items');
      }
    },
  },
};
</script>
