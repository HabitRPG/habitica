/* eslint-disable no-console */
const MIGRATION_NAME = '20190927_kickstarter';
import { v4 as uuid } from 'uuid';

import { model as User } from '../../../website/server/models/user';

const progressCount = 1000;
let count = 0;

async function updateUser (user) {
  count++;

  const set = {};
  let push = {pinnedItems: {$each: []}};

  set.migration = MIGRATION_NAME;
  set['achievements.ks2019'] = true;

  // set['items.gear.owned.armor_special_ks2019'] = false;
  // push.pinnedItems.$each.push({type: 'marketGear', path: 'gear.flat.armor_special_ks2019', _id: uuid()});
  set['items.gear.owned.head_special_ks2019'] = false;
  push.pinnedItems.$each.push({type: 'marketGear', path: 'gear.flat.head_special_ks2019', _id: uuid()});
  // set['items.gear.owned.shield_special_ks2019'] = false;
  // push.pinnedItems.$each.push({type: 'marketGear', path: 'gear.flat.shield_special_ks2019', _id: uuid()});
  // set['items.gear.owned.weapon_special_ks2019'] = false;
  // push.pinnedItems.$each.push({type: 'marketGear', path: 'gear.flat.weapon_special_ks2019', _id: uuid()});
  set['items.gear.owned.eyewear_special_ks2019'] = false;
  push.pinnedItems.$each.push({type: 'marketGear', path: 'gear.flat.eyewear_special_ks2019', _id: uuid()});
  // set['items.pets.Gryphon-Gryphatrice'] = 5;
  // set['items.mounts.Gryphon-Gryphatrice'] = true;

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
