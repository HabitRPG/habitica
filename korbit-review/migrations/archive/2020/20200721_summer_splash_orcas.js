/* eslint-disable no-console */
const MIGRATION_NAME = '20200721_summer_splash_orcas';

import { model as User } from '../../../website/server/models/user';

const progressCount = 1000;
let count = 0;

async function updateUser (user) {
  count++;

  let set;

  if (user && user.items && user.items.pets && typeof user.items.pets['Orca-Base'] !== 'undefined') {
    set = { migration: MIGRATION_NAME };
  } else if (user && user.items && user.items.mounts && typeof user.items.mounts['Orca-Base'] !== 'undefined') {
    set = { migration: MIGRATION_NAME, 'items.pets.Orca-Base': 5 };
  } else {
    set = { migration: MIGRATION_NAME, 'items.mounts.Orca-Base': true };
  }

  if (count % progressCount === 0) console.warn(`${count} ${user._id}`);

  return await User.update({ _id: user._id }, { $set: set }).exec();
}

export default async function processUsers () {
  let query = {
    migration: {$ne: MIGRATION_NAME},
    'auth.timestamps.loggedin': {$gt: new Date('2020-06-21')},
  };

  const fields = {
    _id: 1,
    items: 1,
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
        $gt: users[users.length - 1],
      };
    }

    await Promise.all(users.map(updateUser)); // eslint-disable-line no-await-in-loop
  }
};
