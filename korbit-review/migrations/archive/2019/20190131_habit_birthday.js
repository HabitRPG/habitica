/* eslint-disable no-console */
const MIGRATION_NAME = '20190131_habit_birthday';
import { v4 as uuid } from 'uuid';

import { model as User } from '../../../website/server/models/user';

const progressCount = 1000;
let count = 0;

async function updateUser (user) {
  count++;

  const inc = {
    'items.food.Cake_Skeleton': 1,
    'items.food.Cake_Base': 1,
    'items.food.Cake_CottonCandyBlue': 1,
    'items.food.Cake_CottonCandyPink': 1,
    'items.food.Cake_Shade': 1,
    'items.food.Cake_White': 1,
    'items.food.Cake_Golden': 1,
    'items.food.Cake_Zombie': 1,
    'items.food.Cake_Desert': 1,
    'items.food.Cake_Red': 1,
    'achievements.habitBirthdays': 1,
  };
  const set = {};
  let push;

  set.migration = MIGRATION_NAME;

  if (typeof user.items.gear.owned.armor_special_birthday2018 !== 'undefined') {
    set['items.gear.owned.armor_special_birthday2019'] = false;
    push = {pinnedItems: {type: 'marketGear', path: 'gear.flat.armor_special_birthday2019', _id: uuid()}};
  } else if (typeof user.items.gear.owned.armor_special_birthday2017 !== 'undefined') {
    set['items.gear.owned.armor_special_birthday2018'] = false;
    push = {pinnedItems: {type: 'marketGear', path: 'gear.flat.armor_special_birthday2018', _id: uuid()}};
  } else if (typeof user.items.gear.owned.armor_special_birthday2016 !== 'undefined') {
    set['items.gear.owned.armor_special_birthday2017'] = false;
    push = {pinnedItems: {type: 'marketGear', path: 'gear.flat.armor_special_birthday2017', _id: uuid()}};
  } else if (typeof user.items.gear.owned.armor_special_birthday2015 !== 'undefined') {
    set['items.gear.owned.armor_special_birthday2016'] = false;
    push = {pinnedItems: {type: 'marketGear', path: 'gear.flat.armor_special_birthday2016', _id: uuid()}};
  } else if (typeof user.items.gear.owned.armor_special_birthday !== 'undefined') {
    set['items.gear.owned.armor_special_birthday2015'] = false;
    push = {pinnedItems: {type: 'marketGear', path: 'gear.flat.armor_special_birthday2015', _id: uuid()}};
  } else {
    set['items.gear.owned.armor_special_birthday'] = false;
    push = {pinnedItems: {type: 'marketGear', path: 'gear.flat.armor_special_birthday', _id: uuid()}};
  }

  if (count % progressCount === 0) console.warn(`${count} ${user._id}`);

  return await User.update({_id: user._id}, {$inc: inc, $set: set, $push: push}).exec();
}

module.exports = async function processUsers () {
  let query = {
    migration: {$ne: MIGRATION_NAME},
    'auth.timestamps.loggedin': {$gt: new Date('2019-01-15')},
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
