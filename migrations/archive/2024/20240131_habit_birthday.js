/* eslint-disable no-console */
import { v4 as uuid } from 'uuid';
import { model as User } from '../../../website/server/models/user';

const MIGRATION_NAME = '20240131_habit_birthday';
const progressCount = 1000;
let count = 0;

async function updateUser (user) {
  count += 1;

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
  const push = {
    notifications: {
      type: 'ITEM_RECEIVED',
      data: {
        icon: 'notif_namingDay_cake',
        title: 'Happy Habit Birthday!',
        text: 'Habitica turns 11 today! Enjoy free party robes and cake!',
        destination: 'inventory/equipment',
      },
      seen: false,
    },
  };

  set.migration = MIGRATION_NAME;

  if (typeof user.items.gear.owned.armor_special_birthday2023 !== 'undefined') {
    set['items.gear.owned.armor_special_birthday2024'] = true;
  } else if (typeof user.items.gear.owned.armor_special_birthday2022 !== 'undefined') {
    set['items.gear.owned.armor_special_birthday2023'] = true;
  } else if (typeof user.items.gear.owned.armor_special_birthday2021 !== 'undefined') {
    set['items.gear.owned.armor_special_birthday2022'] = true;
  } else if (typeof user.items.gear.owned.armor_special_birthday2020 !== 'undefined') {
    set['items.gear.owned.armor_special_birthday2021'] = true;
  } else if (typeof user.items.gear.owned.armor_special_birthday2019 !== 'undefined') {
    set['items.gear.owned.armor_special_birthday2020'] = true;
  } else if (typeof user.items.gear.owned.armor_special_birthday2018 !== 'undefined') {
    set['items.gear.owned.armor_special_birthday2019'] = true;
  } else if (typeof user.items.gear.owned.armor_special_birthday2017 !== 'undefined') {
    set['items.gear.owned.armor_special_birthday2018'] = true;
  } else if (typeof user.items.gear.owned.armor_special_birthday2016 !== 'undefined') {
    set['items.gear.owned.armor_special_birthday2017'] = true;
  } else if (typeof user.items.gear.owned.armor_special_birthday2015 !== 'undefined') {
    set['items.gear.owned.armor_special_birthday2016'] = true;
  } else if (typeof user.items.gear.owned.armor_special_birthday !== 'undefined') {
    set['items.gear.owned.armor_special_birthday2015'] = true;
  } else {
    set['items.gear.owned.armor_special_birthday'] = true;
  }

  if (count % progressCount === 0) console.warn(`${count} ${user._id}`);

  return await User.updateOne({_id: user._id}, {$inc: inc, $set: set, $push: push}).exec();
}

export default async function processUsers () {
  let query = {
    migration: {$ne: MIGRATION_NAME},
    'auth.timestamps.loggedin': {$gt: new Date('2023-12-23')},
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
