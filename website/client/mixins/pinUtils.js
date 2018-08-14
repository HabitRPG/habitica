import notifications from 'client/mixins/notifications';

export default {
  mixins: [notifications],
  methods: {
    togglePinned (item) {
      if (!this.$store.dispatch('user:togglePinnedItem', {type: item.pinType, path: item.path})) {
        this.showUnpinNotification(item);
      }
    },
    showUnpinNotification (item) {
      this.text(this.$t('unpinnedItem', {item: item.text}));
    },
  },
};
