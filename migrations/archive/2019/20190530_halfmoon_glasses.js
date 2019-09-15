/* eslint-disable no-console */
const MIGRATION_NAME = '20190530_halfmoon_glasses';
import { v4 as uuid } from 'uuid';

import { model as User } from '../../../website/server/models/user';

const progressCount = 1000;
let count = 0;

async function updateUser (user) {
  count++;

  const set = {
    'items.gear.owned.eyewear_special_blackHalfMoon': true,
    'items.gear.owned.eyewear_special_blueHalfMoon': true,
    'items.gear.owned.eyewear_special_greenHalfMoon': true,
    'items.gear.owned.eyewear_special_pinkHalfMoon': true,
    'items.gear.owned.eyewear_special_redHalfMoon': true,
    'items.gear.owned.eyewear_special_whiteHalfMoon': true,
    'items.gear.owned.eyewear_special_yellowHalfMoon': true,
  };

  set.migration = MIGRATION_NAME;

  if (count % progressCount === 0) console.warn(`${count} ${user._id}`);

  return await User.update({_id: user._id}, {$set: set}).exec();
}

module.exports = async function processUsers () {
  let query = {
    migration: {$ne: MIGRATION_NAME},
    'auth.timestamps.loggedin': {$gt: new Date('2019-05-01')},
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
