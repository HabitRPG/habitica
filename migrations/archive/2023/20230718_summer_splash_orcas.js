/* eslint-disable no-console */
const MIGRATION_NAME = '20230718_summer_splash_orcas';

import { model as User } from '../../../website/server/models/user';

const progressCount = 1000;
let count = 0;

async function updateUser (user) {
  count++;

  const set = { migration: MIGRATION_NAME };
  const push = {};

  if (user && user.items && user.items.pets && typeof user.items.pets['Orca-Base'] !== 'undefined') {
    return;
  } else if (user && user.items && user.items.mounts && typeof user.items.mounts['Orca-Base'] !== 'undefined') {
    set['items.pets.Orca-Base'] = 5;
    push.notifications = {
      type: 'ITEM_RECEIVED',
      data: {
        icon: 'notif_orca_pet',
        title: 'Orcas for Summer Splash!',
        text: 'To celebrate Summer Splash, we\'ve given you an Orca Pet!',
        destination: 'stable',
      },
      seen: false,
    };
  } else {
    set['items.mounts.Orca-Base'] = true;
    push.notifications = {
      type: 'ITEM_RECEIVED',
      data: {
        icon: 'notif_orca_mount',
        title: 'Orcas for Summer Splash!',
        text: 'To celebrate Summer Splash, we\'ve given you an Orca Mount!',
        destination: 'stable',
      },
      seen: false,
    };
  }

  if (count % progressCount === 0) console.warn(`${count} ${user._id}`);

  return await user.updateOne({ $set: set, $push: push }).exec();
}

export default async function processUsers () {
  let query = {
    migration: {$ne: MIGRATION_NAME},
    'auth.timestamps.loggedin': {$gt: new Date('2023-06-18')},
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
