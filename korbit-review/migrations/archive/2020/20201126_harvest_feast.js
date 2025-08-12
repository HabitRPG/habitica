/* eslint-disable no-console */
const MIGRATION_NAME = '20201126_harvest_feast';
import { v4 as uuid } from 'uuid';
import { model as User } from '../../../website/server/models/user';

const progressCount = 1000;
let count = 0;

async function updateUser (user) {
  count++;

  const set = {};
  let inc;
  let push;

  set.migration = MIGRATION_NAME;

  if (typeof user.items.gear.owned.head_special_turkeyHelmGilded !== 'undefined') {
    inc = {
      'items.food.Pie_Base': 1,
      'items.food.Pie_CottonCandyBlue': 1,
      'items.food.Pie_CottonCandyPink': 1,
      'items.food.Pie_Desert': 1,
      'items.food.Pie_Golden': 1,
      'items.food.Pie_Red': 1,
      'items.food.Pie_Shade': 1,
      'items.food.Pie_Skeleton': 1,
      'items.food.Pie_Zombie': 1,
      'items.food.Pie_White': 1,
    }
  } else if (typeof user.items.gear.owned.armor_special_turkeyArmorBase !== 'undefined') {
    set['items.gear.owned.head_special_turkeyHelmGilded'] = false;
    set['items.gear.owned.armor_special_turkeyArmorGilded'] = false;
    set['items.gear.owned.back_special_turkeyTailGilded'] = false;
    push = [
      {
        type: 'marketGear',
        path: 'gear.flat.head_special_turkeyHelmGilded',
        _id: uuid(),
      },
      {
        type: 'marketGear',
        path: 'gear.flat.armor_special_turkeyArmorGilded',
        _id: uuid(),
      },
      {
        type: 'marketGear',
        path: 'gear.flat.back_special_turkeyTailGilded',
        _id: uuid(),
      },
    ];
  } else if (user.items && user.items.mounts && user.items.mounts['Turkey-Gilded']) {
    set['items.gear.owned.head_special_turkeyHelmBase'] = false;
    set['items.gear.owned.armor_special_turkeyArmorBase'] = false;
    set['items.gear.owned.back_special_turkeyTailBase'] = false;
    push = [
      {
        type: 'marketGear',
        path: 'gear.flat.head_special_turkeyHelmBase',
        _id: uuid(),
      },
      {
        type: 'marketGear',
        path: 'gear.flat.armor_special_turkeyArmorBase',
        _id: uuid(),
      },
      {
        type: 'marketGear',
        path: 'gear.flat.back_special_turkeyTailBase',
        _id: uuid(),
      },
    ];
  } else if (user.items && user.items.pets && user.items.pets['Turkey-Gilded']) {
    set['items.mounts.Turkey-Gilded'] = true;
  } else if (user.items && user.items.mounts && user.items.mounts['Turkey-Base']) {
    set['items.pets.Turkey-Gilded'] = 5;
  } else if (user.items && user.items.pets && user.items.pets['Turkey-Base']) {
    set['items.mounts.Turkey-Base'] = true;
  } else {
    set['items.pets.Turkey-Base'] = 5;
  }

  if (count % progressCount === 0) console.warn(`${count} ${user._id}`);

  if (inc) {
    return await User.update({_id: user._id}, {$inc: inc, $set: set}).exec();
  } else if (push) {
    return await User.update({_id: user._id}, {$set: set, $push: {pinnedItems: {$each: push}}}).exec();
  } else {
    return await User.update({_id: user._id}, {$set: set}).exec();
  }
}

export default async function processUsers () {
  let query = {
    migration: {$ne: MIGRATION_NAME},
    'auth.timestamps.loggedin': {$gt: new Date('2019-11-01')},
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
