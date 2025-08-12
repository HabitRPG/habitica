/*
 * All web users should be enrolled in the Drop Cap AB Test
 */
/* eslint-disable no-console */

const MIGRATION_NAME = '20201103_drop_cap_ab_tweaks';

import { model as User } from '../../../website/server/models/user';

const progressCount = 1000;
let count = 0;

async function updateUser (user) {
  count++;

  const set = {};

  set.migration = MIGRATION_NAME;

  const testGroup = Math.random();
  // Enroll 100% of users, splitting them 50/50
  const value = testGroup <= 0.50 ? 'drop-cap-notif-enabled' : 'drop-cap-notif-disabled';
  set['_ABtests.dropCapNotif'] = value;

  if (count % progressCount === 0) console.warn(`${count} ${user._id}`);
  return await User.update({_id: user._id}, {$set: set}).exec();
}

module.exports = async function processUsers () {
  let query = {
    migration: {$ne: MIGRATION_NAME},
    'auth.timestamps.loggedin': {$gt: new Date('2020-10-10')},
    '_ABtests.dropCapNotif': 'drop-cap-notif-not-enrolled',
  };

  const fields = {
    _id: 1,
    _ABtests: 1,
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
