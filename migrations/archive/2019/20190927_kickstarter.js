/* eslint-disable no-console */
const MIGRATION_NAME = '20190927_kickstarter';
import { v4 as uuid } from 'uuid';

import { model as User } from '../../website/server/models/user';

const progressCount = 1000;
let count = 0;

async function updateUser (user) {
  count++;

  const set = {};

  set.migration = MIGRATION_NAME;

  set['items.gear.owned.armor_special_ks2019'] = false;
  const push = {pinnedItems: {type: 'marketGear', path: 'gear.flat.armor_special_ks2019', _id: uuid()}};

  return await User.update({_id: user._id}, {$set: set, $push: push}).exec();
}

module.exports = async function processUsers () {
  let query = {
    migration: {$ne: MIGRATION_NAME},
    'auth.local.lowerCaseUsername': {$in: []},
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
