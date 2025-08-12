/*
 * Award Habitoween ladder items to participants in this month's Habitoween festivities
 */
/* eslint-disable no-console */

const MIGRATION_NAME = '20201029_habitoween_ladder'; // Update when running in future years

import { model as User } from '../../../website/server/models/user';

const progressCount = 1000;
let count = 0;

async function updateUser (user) {
  count++;

  const set = {};
  const inc = {
    'items.food.Candy_Skeleton': 1,
    'items.food.Candy_Base': 1,
    'items.food.Candy_CottonCandyBlue': 1,
    'items.food.Candy_CottonCandyPink': 1,
    'items.food.Candy_Shade': 1,
    'items.food.Candy_White': 1,
    'items.food.Candy_Golden': 1,
    'items.food.Candy_Zombie': 1,
    'items.food.Candy_Desert': 1,
    'items.food.Candy_Red': 1,
  };

  set.migration = MIGRATION_NAME;

  if (user && user.items && user.items.mounts && user.items.mounts['JackOLantern-Glow']) {
    set['items.pets.JackOLantern-RoyalPurple'] = 5;
  } else if (user && user.items && user.items.pets && user.items.pets['JackOLantern-Glow']) {
    set['items.mounts.JackOLantern-Glow'] = true;
  } else if (user && user.items && user.items.mounts && user.items.mounts['JackOLantern-Ghost']) {
    set['items.pets.JackOLantern-Glow'] = 5;
  } else if (user && user.items && user.items.pets && user.items.pets['JackOLantern-Ghost']) {
    set['items.mounts.JackOLantern-Ghost'] = true;
  } else if (user && user.items && user.items.mounts && user.items.mounts['JackOLantern-Base']) {
    set['items.pets.JackOLantern-Ghost'] = 5;
  } else if (user && user.items && user.items.pets && user.items.pets['JackOLantern-Base']) {
    set['items.mounts.JackOLantern-Base'] = true;
  } else {
    set['items.pets.JackOLantern-Base'] = 5;
  }

  if (count % progressCount === 0) console.warn(`${count} ${user._id}`);
  return await User.update({_id: user._id}, {$inc: inc, $set: set}).exec();
}

module.exports = async function processUsers () {
  let query = {
    migration: {$ne: MIGRATION_NAME},
    'auth.timestamps.loggedin': {$gt: new Date('2020-10-01')},
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
