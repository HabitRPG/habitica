/* eslint-disable no-console */
import { v4 as uuid } from 'uuid';
import { model as User } from '../../../website/server/models/user';

const MIGRATION_NAME = '20230201_habit_birthday_day10';
const progressCount = 1000;
let count = 0;

async function updateUser (user) {
  count += 1;

  const set = { 
    migration: MIGRATION_NAME,
    'purchased.background.birthday_bash': true,
  };
  const push = {
    notifications: {
      type: 'ITEM_RECEIVED',
      data: {
        icon: 'notif_head_special_nye',
        title: 'Birthday Bash Day 10!',
        text: 'Join in for the end of our birthday celebrations with 10th Birthday background, Cake, and achievement!',
        destination: 'backgrounds',
      },
      seen: false,
    },
  };
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

  if (count % progressCount === 0) console.warn(`${count} ${user._id}`);

  return await User.update({_id: user._id}, {$set: set, $push: push, $inc: inc }).exec();
}

export default async function processUsers () {
  let query = {
    migration: {$ne: MIGRATION_NAME},
    'auth.timestamps.loggedin': {$gt: new Date('2022-12-23')},
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
