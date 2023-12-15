/* eslint-disable no-console */
const MIGRATION_NAME = '20231228_nye';
import { model as User } from '../../../website/server/models/user';
import { v4 as uuid } from 'uuid';

const progressCount = 1000;
let count = 0;

async function updateUser (user) {
  count++;

  const set = { migration: MIGRATION_NAME };
  let push = {};

  if (typeof user.items.gear.owned.head_special_nye2022 !== 'undefined') {
    set['items.gear.owned.head_special_nye2023'] = true;
  } else if (typeof user.items.gear.owned.head_special_nye2021 !== 'undefined') {
    set['items.gear.owned.head_special_nye2022'] = true;
  } else if (typeof user.items.gear.owned.head_special_nye2020 !== 'undefined') {
    set['items.gear.owned.head_special_nye2021'] = true;
  } else if (typeof user.items.gear.owned.head_special_nye2019 !== 'undefined') {
    set['items.gear.owned.head_special_nye2020'] = true;
  } else if (typeof user.items.gear.owned.head_special_nye2018 !== 'undefined') {
    set['items.gear.owned.head_special_nye2019'] = true;
  } else if (typeof user.items.gear.owned.head_special_nye2017 !== 'undefined') {
    set['items.gear.owned.head_special_nye2018'] = true;
  } else if (typeof user.items.gear.owned.head_special_nye2016 !== 'undefined') {
    set['items.gear.owned.head_special_nye2017'] = true;
  } else if (typeof user.items.gear.owned.head_special_nye2015 !== 'undefined') {
    set['items.gear.owned.head_special_nye2016'] = true;
  } else if (typeof user.items.gear.owned.head_special_nye2014 !== 'undefined') {
    set['items.gear.owned.head_special_nye2015'] = true;
  } else if (typeof user.items.gear.owned.head_special_nye !== 'undefined') {
    set['items.gear.owned.head_special_nye2014'] = true;
  } else {
    set['items.gear.owned.head_special_nye'] = true;
  }

  push.notifications = {
    type: 'ITEM_RECEIVED',
    data: {
      icon: 'notif_head_special_nye',
      title: 'Happy New Year!',
      text: 'Check your Equipment for this year\'s party hat!',
      destination: 'inventory/equipment',
    },
    seen: false,
  };

  if (count % progressCount === 0) console.warn(`${count} ${user._id}`);

  return await User.updateOne({_id: user._id}, {$set: set, $push: push}).exec();
}

export default async function processUsers () {
  let query = {
    'auth.timestamps.loggedin': { $gt: new Date('2023-12-01') },
    migration: { $ne: MIGRATION_NAME },
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
