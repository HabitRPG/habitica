export default {
  methods: {
    makeGenericPurchase (item) {
      this.$store.dispatch('shops:genericPurchase', {
        pinType: item.pinType,
        type: item.purchaseType,
        key: item.key,
        currency: item.currency,
      });
      this.$root.$emit('buyModal::boughtItem', item);
      this.$root.$emit('playSound', 'Reward');
    },
  },
};
