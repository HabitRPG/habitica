/* eslint-disable no-console */
import { model as UserModel } from '../../../website/server/models/user';
import { TransactionModel } from '../../../website/server/models/transaction';

const MIGRATION_NAME = '20220915_transactions_user_name';

/* transaction config */
const transactionPerRun = 500;
const progressCount = 1000;
const transactionQuery = {
  migration: { $ne: MIGRATION_NAME }, // skip already migrated entries
  'transactionType': { $in: ['gift_send', 'gift_receive'] },
};

let count = 0;
async function updateTransaction (transaction, userNameMap) {
  count++;

  const set = {
    migration: MIGRATION_NAME,
  };

  if (userNameMap.has(transaction.reference)) {
    set['referenceText'] = userNameMap.get(transaction.reference);
  } else {
    set['referenceText'] = 'Account not found';
  }

  if (count % progressCount === 0) {
    console.warn(`${count} ${transaction._id}`);
  }

  return TransactionModel.updateOne({
    _id: transaction._id
  }, { $set: set }).exec();
}

export default async function processTransactions () {
  const fields = {
    _id: 1,
    reference: 1,
    referenceText: 1,
  };

  const userNameMap = new Map();

  while (true) { // eslint-disable-line no-constant-condition
    const foundTransactions = await TransactionModel // eslint-disable-line no-await-in-loop
      .find(transactionQuery)
      .limit(transactionPerRun)
      .sort({reference: 1})
      .select(fields)
      .lean()
      .exec();

    if (foundTransactions.length === 0) {
      console.warn('All appropriate transactions found and modified.');
      console.warn(`\n${count} transactions processed\n`);
      break;
    }

    // check for unknown users and load the names
    const userIdsToLoad = [];
    for (const foundTransaction of foundTransactions) {
      const userId = foundTransaction.reference;
      if (userNameMap.has(userId))  {
        continue;
      }

      userIdsToLoad.push(userId);
    }

    const users = await UserModel // eslint-disable-line no-await-in-loop
      .find({
        _id: { $in: userIdsToLoad }
      })
      .select({
        _id: 1,
        'auth.local.username': 1,
      })
      .lean()
      .exec();

    for (const user of users) {
      const localUserName = user.auth?.local?.username;

      if (!localUserName) {
        console.warn(`\nNo Username found for ID: ${user._id}\n`);
        continue;
      }

      userNameMap.set(user._id, localUserName)
    }

    await Promise.all(foundTransactions.map(t => updateTransaction(t, userNameMap))); // eslint-disable-line no-await-in-loop
  }
};
