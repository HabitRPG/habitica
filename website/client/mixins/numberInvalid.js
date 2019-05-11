export default {
  computed: {
    numberInvalid () {
      return this.selectedAmountToBuy < 1 || !Number.isInteger(this.selectedAmountToBuy);
    },
  },
};
