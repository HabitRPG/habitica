/* eslint-disable no-console */
import { model as User } from '../../../website/server/models/user';
import { TransactionModel as Transaction } from '../../../website/server/models/transaction';

const transactionsPerRun = 500;
const progressCount = 1000;
const transactionsQuery = {
  transactionType: 'create_guild',
  amount: { $gt: 0 },
};

let count = 0;
async function updateTransaction (transaction) {
  count++;
  if (count % progressCount === 0) {
    console.warn(`${count} ${transaction._id}`);
  }

  const leader = await User
    .findOne({ _id: transaction.userId })
    .select({ _id: true })
    .exec();

  if (!leader) {
    return console.warn(`User not found for transaction ${transaction._id}`);
  }

  return leader.updateOne(
    { $inc: { balance: transaction.amount }},
  ).exec();
}

export default async function processTransactions () {
  const transactionFields = {
    _id: 1,
    userId: 1,
    currency: 1,
    amount: 1,
  };

  while (true) { // eslint-disable-line no-constant-condition
    const foundTransactions = await Transaction // eslint-disable-line no-await-in-loop
      .find(transactionsQuery)
      .limit(transactionsPerRun)
      .sort({ _id: 1 })
      .select(transactionFields)
      .lean()
      .exec();

    if (foundTransactions.length === 0) {
      console.warn('All appropriate transactions found and modified.');
      console.warn(`\n${count} transactions processed\n`);
      break;
    } else {
      transactionsQuery._id = {
        $gt: foundTransactions[foundTransactions.length - 1],
      };
    }

    await Promise.all(foundTransactions.map(txn => updateTransaction(txn))); // eslint-disable-line no-await-in-loop
  }
};
