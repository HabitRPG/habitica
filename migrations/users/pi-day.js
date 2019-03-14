/* eslint-disable no-console */
const MIGRATION_NAME = '20190314_pi_day';
import { v4 as uuid } from 'uuid';

import { model as User } from '../../website/server/models/user';

const progressCount = 1000;
let count = 0;

async function updateUser (user) {
  count++;

  const inc = {
    'items.food.Pie_Skeleton': 1,
    'items.food.Pie_Base': 1,
    'items.food.Pie_CottonCandyBlue': 1,
    'items.food.Pie_CottonCandyPink': 1,
    'items.food.Pie_Shade': 1,
    'items.food.Pie_White': 1,
    'items.food.Pie_Golden': 1,
    'items.food.Pie_Zombie': 1,
    'items.food.Pie_Desert': 1,
    'items.food.Pie_Red': 1,
  };
  const set = {};

  set.migration = MIGRATION_NAME;

  set['items.gear.owned.head_special_piDay'] = false;
  set['items.gear.owned.shield_special_piDay'] = false;
  const push = [
    {type: 'marketGear', path: 'gear.flat.head_special_piDay', _id: uuid()},
    {type: 'marketGear', path: 'gear.flat.shield_special_piDay', _id: uuid()},
  ];

  if (count % progressCount === 0) console.warn(`${count} ${user._id}`);

  return await User.update({_id: user._id}, {$inc: inc, $set: set, $push: {pinnedItems: {$each: push}}}).exec();
}

module.exports = async function processUsers () {
  let query = {
    migration: {$ne: MIGRATION_NAME},
    'auth.timestamps.loggedin': {$gt: new Date('2019-02-15')},
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
