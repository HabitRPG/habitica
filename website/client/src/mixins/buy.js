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
        }
        throw e;
      }

      this.$root.$emit('playSound', 'Reward');

      if (type !== 'buyModal') {
        this.$emit('buyPressed', this.item);
        return;
      }

      this.$root.$emit('buyModal::boughtItem', item);
    },
    confirmPurchase (currency, cost) {
      const currencyToPurchaseForKey = {
        gems: 'purchaseFor',
        gold: 'purchaseForGold',
        hourglasses: 'purchaseForHourglasses',
      };

      const purchaseForKey = currencyToPurchaseForKey[currency];
      return window.confirm(this.$t(purchaseForKey, { cost })); // eslint-disable-line no-alert
    },
  },
};
