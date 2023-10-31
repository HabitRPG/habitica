import isPinned from '@/../../common/script/libs/isPinned';
import notifications from '@/mixins/notifications';

export default {
  mixins: [notifications],
  methods: {
    isPinned (item) {
      return isPinned(this.user, item);
    },
    togglePinned (item) {
      if (!this.$store.dispatch('user:togglePinnedItem', { type: item.pinType, path: item.path })) {
        this.showUnpinNotification(item);
      }
    },
    showUnpinNotification (item) {
      this.text(this.$t('unpinnedItem', { item: item.text }));
    },
  },
};
