/* eslint-disable no-console */
const MIGRATION_NAME = '20200402_webhooks_reenable';
import { model as User } from '../../../website/server/models/user';

const progressCount = 1000;
let count = 0;

async function updateUser (user) {
  count++;

  const set = {
    migration: MIGRATION_NAME,
  };

  if (user && user.webhooks && user.webhooks.length > 0) {
    user.webhooks.forEach(webhook => {
      // Re-enable webhooks disabled because of too many failures
      if (webhook.enabled === false && webhook.lastFailureAt === null) {
        webhook.enabled = true;
      }
    });

    set.webhooks = user.webhooks;
  }

  if (count % progressCount === 0) console.warn(`${count} ${user._id}`);

  return await User.update({ _id: user._id }, { $set: set }).exec();
}

module.exports = async function processUsers () {
  let query = {
    migration: { $ne: MIGRATION_NAME },
    webhooks: { $exists: true, $not: { $size: 0 } },
  };

  const fields = {
    _id: 1,
    webhooks: 1,
  };

  while (true) { // eslint-disable-line no-constant-condition
    const users = await User // eslint-disable-line no-await-in-loop
      .find(query)
      .limit(250)
      .sort({_id: 1})
      .select(fields)
      .lean()
      .exec();

    if (users.length === 0) {
      console.warn('All appropriate users found and modified.');
      console.warn(`\n${count} users processed\n`);
      break;
    } else {
      query._id = {
        $gt: users[users.length - 1]._id,
      };
    }

    await Promise.all(users.map(updateUser)); // eslint-disable-line no-await-in-loop
  }
};
