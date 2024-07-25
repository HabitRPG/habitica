/* eslint-disable no-console */
const MIGRATION_NAME = '2024_purge_invite_accepted';
import { model as User } from '../../../website/server/models/user';

const progressCount = 1000;
let count = 0;

async function updateUser (user) {
  count++;

  return await User.updateOne(
    { _id: user._id },
    { $pull: { notifications: { type: 'GROUP_INVITE_ACCEPTED' } } },
  ).exec();
}

export default async function processUsers () {
  let query = {
    migration: {$ne: MIGRATION_NAME},
    'notifications.type': 'GROUP_INVITE_ACCEPTED',
    'auth.timestamps.loggedin': { $gt: new Date('2024-06-25') },
  };

  const fields = {
    _id: 1,
    items: 1,
    migration: 1,
    contributor: 1,
  };

  while (true) { // eslint-disable-line no-constant-condition
    const users = await User // eslint-disable-line no-await-in-loop
      .find(query)
      .limit(250)
      .sort({_id: 1})
      .select(fields)
      .exec();

    if (users.length === 0) {
      console.warn('All appropriate users found and modified.');
      console.warn(`\n${count} users processed\n`);
      break;
    } else {
      query._id = {
        $gt: users[users.length - 1],
      };
    }

    await Promise.all(users.map(updateUser)); // eslint-disable-line no-await-in-loop
  }
};
