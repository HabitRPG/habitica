/*
 * Fix JackOLantern-Base for users that signed up recently
 */
/* eslint-disable no-console */

const MIGRATION_NAME = '20201102_fix_habitoween'; // Update when running in future years

import { model as User } from '../../../website/server/models/user';

const progressCount = 1000;
let count = 0;

async function updateUser (user) {
  count++;

  const set = {};

  set.migration = MIGRATION_NAME;
  set['items.pets.JackOLantern-Base'] = 5;

  if (count % progressCount === 0) console.warn(`${count} ${user._id}`);
  return await User.update({_id: user._id}, {$inc: inc, $set: set}).exec();
}

module.exports = async function processUsers () {
  let query = {
    migration: {$ne: MIGRATION_NAME},
    'auth.timestamps.created': {$gt: new Date('2020-10-26')},
    'items.pets.JackOLantern-Base': true,
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
