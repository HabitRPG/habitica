/* eslint-disable no-console */
const MIGRATION_NAME = '20191231_nye';
import { model as User } from '../../../website/server/models/user';
import { v4 as uuid } from 'uuid';

const progressCount = 1000;
let count = 0;

async function updateUser (user) {
  count++;

  const set = {'flags.newStuff': true};
  let push;

  set.migration = MIGRATION_NAME;

  if (typeof user.items.gear.owned.head_special_nye2018 !== 'undefined') {
    set['items.gear.owned.head_special_nye2019'] = false;
    push = [
      {
        type: 'marketGear',
        path: 'gear.flat.head_special_nye2019',
        _id: uuid(),
      },
    ];
  } else if (typeof user.items.gear.owned.head_special_nye2017 !== 'undefined') {
    set['items.gear.owned.head_special_nye2018'] = false;
    push = [
      {
        type: 'marketGear',
        path: 'gear.flat.head_special_nye2018',
        _id: uuid(),
      },
    ];
  } else if (typeof user.items.gear.owned.head_special_nye2016 !== 'undefined') {
    set['items.gear.owned.head_special_nye2017'] = false;
    push = [
      {
        type: 'marketGear',
        path: 'gear.flat.head_special_nye2017',
        _id: uuid(),
      },
    ];
  } else if (typeof user.items.gear.owned.head_special_nye2015 !== 'undefined') {
    set['items.gear.owned.head_special_nye2016'] = false;
    push = [
      {
        type: 'marketGear',
        path: 'gear.flat.head_special_nye2016',
        _id: uuid(),
      },
    ];
  } else if (typeof user.items.gear.owned.head_special_nye2014 !== 'undefined') {
    set['items.gear.owned.head_special_nye2015'] = false;
    push = [
      {
        type: 'marketGear',
        path: 'gear.flat.head_special_nye2015',
        _id: uuid(),
      },
    ];
  } else if (typeof user.items.gear.owned.head_special_nye !== 'undefined') {
    set['items.gear.owned.head_special_nye2014'] = false;
    push = [
      {
        type: 'marketGear',
        path: 'gear.flat.head_special_nye2014',
        _id: uuid(),
      },
    ];
  } else {
    set['items.gear.owned.head_special_nye'] = false;
    push = [
      {
        type: 'marketGear',
        path: 'gear.flat.head_special_nye',
        _id: uuid(),
      },
    ];
  }

  if (count % progressCount === 0) console.warn(`${count} ${user._id}`);

  return await User.update({_id: user._id}, {$set: set, $push: {pinnedItems: {$each: push}}}).exec();
}

export default async function processUsers () {
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
