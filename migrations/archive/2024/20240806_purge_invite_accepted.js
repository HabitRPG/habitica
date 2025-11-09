/* eslint-disable no-console */
import { model as User } from '../../../website/server/models/user';

const MIGRATION_NAME = '2024_purge_invite_accepted';
const progressCount = 1000;
let count = 0;

async function updateUsers (userIds) {
  count += userIds.length;
  if (count % progressCount === 0) console.warn(`${count} ${userIds[0]}`);

  return await User.updateMany(
    { _id: { $in: userIds } },
    { $pull: { notifications: { type: 'GROUP_INVITE_ACCEPTED' } } },
  ).exec();
}

export default async function processUsers () {
  let query = {
    migration: { $ne: MIGRATION_NAME },
    'notifications.type': 'GROUP_INVITE_ACCEPTED',
    'auth.timestamps.loggedin': { $gt: new Date('2024-06-25') },
  };

  while (true) { // eslint-disable-line no-constant-condition
    const users = await User // eslint-disable-line no-await-in-loop
      .find(query)
      .limit(250)
      .sort({ _id: 1 })
      .select({ _id: 1 })
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

    const userIds = users.map(user => user._id);

    await updateUsers(userIds); // eslint-disable-line no-await-in-loop
  }
};
