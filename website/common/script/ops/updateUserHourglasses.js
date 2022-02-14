export default async function updateUserHourglasses (user,
  amount,
  transactionType,
  reference,
  referenceText) {
  if (user.constructor.name === 'model') {
    await user.purchased.plan.updateHourglasses(user._id,
      amount,
      transactionType,
      reference,
      referenceText);
  } else {
    user.purchased.plan.consecutive.trinkets += amount;
  }
}
