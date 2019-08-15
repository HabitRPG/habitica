/* eslint-disable no-console */
const MIGRATION_NAME = '20190816_brilliant_bloom_fix';
import { v4 as uuid } from 'uuid';

import { model as User } from '../../../website/server/models/user';

const progressCount = 1000;
let count = 0;

async function updateUser (user) {
  count++;
  if (count % progressCount === 0) console.warn(`${count} ${user._id}`);
  return await User.update(
    { _id: user._id },
    { $unset: {'items.gear.equipped.shield': 1} }
  ).exec();
}

module.exports = async function processUsers () {
  let query = {
    migration: { $ne: MIGRATION_NAME },
    'items.gear.equipped.weapon': 'weapon_special_summer2019Mage',
    'items.gear.equipped.shield': { $exists: true },
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
        $gt: users[users.length - 1]._id,
      };
    }

    await Promise.all(users.map(updateUser)); // eslint-disable-line no-await-in-loop
  }
};
