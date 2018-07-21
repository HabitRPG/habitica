export default {
  methods: {
    async makeGenericPurchase (item, type = 'buyModal', quantity = 1) {
      try {
        await this.$store.dispatch('shops:genericPurchase', {
          pinType: item.pinType,
          type: item.purchaseType,
          key: item.key,
          currency: item.currency,
          quantity,
        });
      } catch (e) {
        if (!e.request) {
          // axios request errors already handled by app.vue
          this.$store.dispatch('snackbars:add', {
            title: '',
            text: e.message,
            type: 'error',
          });
          return;
        } else {
          throw e;
        }
      }

      this.$root.$emit('playSound', 'Reward');

      if (type !== 'buyModal') {
        this.$emit('buyPressed', this.item);
        return;
      }

      this.$root.$emit('buyModal::boughtItem', item);
    },
  },
};
