export default async function updateUserBalance (user, amount, transactionType, reference) {
  if (user.constructor.name === 'model') {
    await user.updateBalance(amount, transactionType, reference);
  } else {
    user.balance += amount;
  }
}
