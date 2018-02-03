export default {
  methods: {
    makeGenericPurchase (item, type = 'buyModal', quantity = 1) {
      this.$store.dispatch('shops:genericPurchase', {
        pinType: item.pinType,
        type: item.purchaseType,
        key: item.key,
        currency: item.currency,
        quantity,
      });

      this.$root.$emit('playSound', 'Reward');

      if (type !== 'buyModal') {
        this.$emit('buyPressed', this.item);
        return;
      }

      this.$root.$emit('buyModal::boughtItem', item);
    },
  },
};
