export default {
  computed: {
    numberInvalid () {
      const inputNumber = Number(this.selectedAmountToBuy);
      return inputNumber < 1
      || !Number.isInteger(inputNumber);
    },
  },
};
