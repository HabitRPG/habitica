export default async function updateUserBalance (user,
  amount,
  transactionType,
  reference,
  referenceText) {
  if (user.constructor.name === 'model') {
    await user.updateBalance(amount, transactionType, reference, referenceText);
  } else {
    user.balance += amount;
  }
}
