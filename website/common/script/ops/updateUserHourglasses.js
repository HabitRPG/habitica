export default async function updateUserHourglasses (user, amount, transactionType, reference) {
  if (user.constructor.name === 'model') {
    await user.purchased.plan.updateHourglasses(user._id, amount, transactionType, reference);
  } else {
    user.purchased.plan.consecutive.trinkets += amount;
  }
}
