/* eslint-disable no-console */
const MIGRATION_NAME = '20181122_turkey_day';
import mongoose from 'mongoose';
import { model as User } from '../../website/server/models/user';

const progressCount = 1000;
let count = 0;

async function updateUser (user) {
  count++;

  const set = {};
  let push;

  set.migration = MIGRATION_NAME;

  if (typeof user.items.gear.owned.armor_special_turkeyArmorBase !== 'undefined') {
    set['items.gear.owned.head_special_turkeyHelmGilded'] = false;
    set['items.gear.owned.armor_special_turkeyArmorGilded'] = false;
    set['items.gear.owned.back_special_turkeyTailGilded'] = false;
    push = [
      {
        type: 'marketGear',
        path: 'gear.flat.head_special_turkeyHelmGilded',
        _id: new mongoose.Types.ObjectId(),
      },
      {
        type: 'marketGear',
        path: 'gear.flat.armor_special_turkeyArmorGilded',
        _id: new mongoose.Types.ObjectId(),
      },
      {
        type: 'marketGear',
        path: 'gear.flat.back_special_turkeyTailGilded',
        _id: new mongoose.Types.ObjectId(),
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
        _id: new mongoose.Types.ObjectId(),
      },
      {
        type: 'marketGear',
        path: 'gear.flat.armor_special_turkeyArmorBase',
        _id: new mongoose.Types.ObjectId(),
      },
      {
        type: 'marketGear',
        path: 'gear.flat.back_special_turkeyTailBase',
        _id: new mongoose.Types.ObjectId(),
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

  if (push) {
    return await User.update({_id: user._id}, {$set: set, $push: {pinnedItems: {$each: push}}}).exec();
  } else {
    return await User.update({_id: user._id}, {$set: set}).exec();
  }
}

module.exports = async function processUsers () {
  let query = {
    migration: {$ne: MIGRATION_NAME},
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
