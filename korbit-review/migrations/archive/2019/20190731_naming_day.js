/* eslint-disable no-console */
const MIGRATION_NAME = '20190731_naming_day';
import { v4 as uuid } from 'uuid';

import { model as User } from '../../../website/server/models/user';

const progressCount = 1000;
let count = 0;

async function updateUser (user) {
  count++;

  let set;
  let push;
  const inc = {
    'items.food.Cake_Base': 1,
    'items.food.Cake_CottonCandyBlue': 1,
    'items.food.Cake_CottonCandyPink': 1,
    'items.food.Cake_Desert': 1,
    'items.food.Cake_Golden': 1,
    'items.food.Cake_Red': 1,
    'items.food.Cake_Shade': 1,
    'items.food.Cake_Skeleton': 1,
    'items.food.Cake_White': 1,
    'items.food.Cake_Zombie': 1,
    'achievements.habiticaDays': 1,
  };

  if (user && user.items && user.items.gear && user.items.gear.owned && typeof user.items.gear.owned.body_special_namingDay2018 !== 'undefined') {
    set = { migration: MIGRATION_NAME };
  } else if (user && user.items && user.items.gear && user.items.gear.owned && typeof user.items.gear.owned.head_special_namingDay2017 !== 'undefined') {
    set = { migration: MIGRATION_NAME, 'items.gear.owned.body_special_namingDay2018': false };
    push = { pinnedItems: { type: 'marketGear', path: 'gear.flat.body_special_namingDay2018', _id: uuid() }};
  } else if (user && user.items && user.items.pets && typeof user.items.pets['Gryphon-RoyalPurple'] !== 'undefined') {
    set = { migration: MIGRATION_NAME, 'items.gear.owned.head_special_namingDay2017': false };
    push = { pinnedItems: { type: 'marketGear', path: 'gear.flat.head_special_namingDay2017', _id: uuid() }};
  } else if (user && user.items && user.items.mounts && typeof user.items.mounts['Gryphon-RoyalPurple'] !== 'undefined') {
    set = { migration: MIGRATION_NAME, 'items.pets.Gryphon-RoyalPurple': 5 };
  } else {
    set = { migration: MIGRATION_NAME, 'items.mounts.Gryphon-RoyalPurple': true };
  }

  if (count % progressCount === 0) console.warn(`${count} ${user._id}`);

  if (push) {
    return await User.update({ _id: user._id }, { $set: set, $inc: inc, $push: push }).exec();
  } else {
    return await User.update({ _id: user._id }, { $set: set, $inc: inc }).exec();
  }
}

module.exports = async function processUsers () {
  let query = {
    migration: { $ne: MIGRATION_NAME },
    'auth.timestamps.loggedin': { $gt: new Date('2019-07-01') },
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
