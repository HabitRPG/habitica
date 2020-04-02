/* eslint-disable no-console */
const MIGRATION_NAME = '20200402_webhooks_add_protocol';
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
      // Make sure the protocol is set and valid
      if (webhook.url.startsWith('ftp')) {
        webhook.url = webhook.url.replace('ftp', 'https');
      }

      if (!webhook.url.startsWith('http://') && !webhook.url.startsWith('https://')) {
        // the default in got 9 was https
        // see https://github.com/sindresorhus/got/commit/92bc8082137d7d085750359bbd76c801e213d7d2#diff-0730bb7c2e8f9ea2438b52e419dd86c9L111
        webhook.url = `https://${webhook.url}`;
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
