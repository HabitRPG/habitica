/* eslint-disable no-console */
import { v4 as uuid } from 'uuid';

import { model as User } from '../../website/server/models/user';

const MIGRATION_NAME = '20181203_take_this';

const progressCount = 1000;
let count = 0;

async function updateUser (user) {
  count += 1;

  const set = {};
  let push;

  set.migration = MIGRATION_NAME;

  if (typeof user.items.gear.owned.back_special_takeThis !== 'undefined') {
    push = false;
  } else if (typeof user.items.gear.owned.body_special_takeThis !== 'undefined') {
    set['items.gear.owned.back_special_takeThis'] = false;
    push = { pinnedItems: { type: 'marketGear', path: 'gear.flat.back_special_takeThis', _id: uuid() } };
  } else if (typeof user.items.gear.owned.head_special_takeThis !== 'undefined') {
    set['items.gear.owned.body_special_takeThis'] = false;
    push = { pinnedItems: { type: 'marketGear', path: 'gear.flat.body_special_takeThis', _id: uuid() } };
  } else if (typeof user.items.gear.owned.armor_special_takeThis !== 'undefined') {
    set['items.gear.owned.head_special_takeThis'] = false;
    push = { pinnedItems: { type: 'marketGear', path: 'gear.flat.head_special_takeThis', _id: uuid() } };
  } else if (typeof user.items.gear.owned.weapon_special_takeThis !== 'undefined') {
    set['items.gear.owned.armor_special_takeThis'] = false;
    push = { pinnedItems: { type: 'marketGear', path: 'gear.flat.armor_special_takeThis', _id: uuid() } };
  } else if (typeof user.items.gear.owned.shield_special_takeThis !== 'undefined') {
    set['items.gear.owned.weapon_special_takeThis'] = false;
    push = { pinnedItems: { type: 'marketGear', path: 'gear.flat.weapon_special_takeThis', _id: uuid() } };
  } else {
    set['items.gear.owned.shield_special_takeThis'] = false;
    push = { pinnedItems: { type: 'marketGear', path: 'gear.flat.shield_special_takeThis', _id: uuid() } };
  }

  if (count % progressCount === 0) console.warn(`${count} ${user._id}`);

  if (push) {
    return User.update({ _id: user._id }, { $set: set, $push: push }).exec();
  }
  return User.update({ _id: user._id }, { $set: set }).exec();
}

export default async function processUsers () {
  const query = {
    migration: { $ne: MIGRATION_NAME },
    challenges: '00708425-d477-41a5-bf27-6270466e7976',
  };

  const fields = {
    _id: 1,
    items: 1,
  };

  while (true) { // eslint-disable-line no-constant-condition
    const users = await User // eslint-disable-line no-await-in-loop
      .find(query)
      .limit(250)
      .sort({ _id: 1 })
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
}
