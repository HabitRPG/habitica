/* eslint-disable no-console */
import { v4 as uuid } from 'uuid';
import { model as User } from '../../../website/server/models/user';

const MIGRATION_NAME = '20230127_habit_birthday_day5';
const progressCount = 1000;
let count = 0;

async function updateUser (user) {
  count += 1;

  const set = {};
  const push = {};

  set.migration = MIGRATION_NAME;

  set['items.gear.owned.back_special_anniversary'] = true;
  set['items.gear.owned.body_special_anniversary'] = true;
  set['items.gear.owned.eyewear_special_anniversary'] = true;

  push.notifications = {
    type: 'ITEM_RECEIVED',
    data: {
      icon: 'notif_head_special_nye',
      title: 'Birthday Bash Day 5!',
      text: 'Come celebrate by wearing your new Habitica Hero Cape, Collar, and Mask!',
      destination: 'equipment',
    },
    seen: false,
  };

  if (count % progressCount === 0) console.warn(`${count} ${user._id}`);

  return await User.update({_id: user._id}, {$set: set, $push: push}).exec();
}

export default async function processUsers () {
  let query = {
    migration: {$ne: MIGRATION_NAME},
    'auth.timestamps.loggedin': {$gt: new Date('2022-12-23')},
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
