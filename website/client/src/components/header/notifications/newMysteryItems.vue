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
      v-html="$t('newSubscriberItem')"
    ></div>
    <Sprite
      slot="icon"
      :image-name="mysteryClass"
    />
  </base-notification>
</template>

<script>
import moment from 'moment';
import BaseNotification from './base';
import Sprite from '@/components/ui/sprite.vue';

export default {
  components: {
    BaseNotification,
    Sprite,
  },
  props: ['notification', 'canRemove'],
  computed: {
    mysteryClass () {
      return `notif_inventory_present_${moment().format('MM')}`;
    },
  },
  methods: {
    action () {
      this.$router.push({ name: 'items' });
    },
  },
};
</script>
