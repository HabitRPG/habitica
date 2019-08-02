/* eslint-disable no-console */
const MIGRATION_NAME = '20190902_take_this';
import { v4 as uuid } from 'uuid';
import sortBy from 'lodash/sortBy';

import { model as User } from '../../website/server/models/user';

const progressCount = 1000;
let count = 0;

async function updateUser (user) {
  count++;

  let set;

  let migrationsArray = sortBy(user.migrations, ['processed']);
  if (migrationsArray.length > 4) {
    migrationsArray = migrationsArray.slice(1);
  }

  let newMigration = {
    name: MIGRATION_NAME,
    processed: new Date(),
  };

  let push;
  if (typeof user.items.gear.owned.back_special_takeThis !== 'undefined') {
    push = false;
  } else if (typeof user.items.gear.owned.body_special_takeThis !== 'undefined') {
    set['items.gear.owned.back_special_takeThis'] = false;
    newMigration.item = 'back_special_takeThis';
    push = {pinnedItems: {type: 'marketGear', path: 'gear.flat.back_special_takeThis', _id: uuid()}};
  } else if (typeof user.items.gear.owned.head_special_takeThis !== 'undefined') {
    set['items.gear.owned.body_special_takeThis'] = false;
    newMigration.item = 'body_special_takeThis';
    push = {pinnedItems: {type: 'marketGear', path: 'gear.flat.body_special_takeThis', _id: uuid()}};
  } else if (typeof user.items.gear.owned.armor_special_takeThis !== 'undefined') {
    set['items.gear.owned.head_special_takeThis'] = false;
    newMigration.item = 'head_special_takeThis';
    push = {pinnedItems: {type: 'marketGear', path: 'gear.flat.head_special_takeThis', _id: uuid()}};
  } else if (typeof user.items.gear.owned.weapon_special_takeThis !== 'undefined') {
    set['items.gear.owned.armor_special_takeThis'] = false;
    newMigration.item = 'armor_special_takeThis';
    push = {pinnedItems: {type: 'marketGear', path: 'gear.flat.armor_special_takeThis', _id: uuid()}};
  } else if (typeof user.items.gear.owned.shield_special_takeThis !== 'undefined') {
    set['items.gear.owned.weapon_special_takeThis'] = false;
    newMigration.item = 'weapon_special_takeThis';
    push = {pinnedItems: {type: 'marketGear', path: 'gear.flat.weapon_special_takeThis', _id: uuid()}};
  } else {
    set['items.gear.owned.shield_special_takeThis'] = false;
    newMigration.item = 'shield_special_takeThis';
    push = {pinnedItems: {type: 'marketGear', path: 'gear.flat.shield_special_takeThis', _id: uuid()}};
  }

  migrationsArray.push(newMigration);
  set.migrations = migrationsArray;

  if (count % progressCount === 0) console.warn(`${count} ${user._id}`);

  if (push) {
    return await User.update({_id: user._id}, {$set: set, $push: push}).exec();
  } else {
    return await User.update({_id: user._id}, {$set: set}).exec();
  }
}

module.exports = async function processUsers () {
  let query = {
    'migrations.name': { $ne: MIGRATION_NAME },
    challenges: '6438d355-1b00-4987-a5da-b78a2c806293',
  };

  const fields = {
    _id: 1,
    items: 1,
    migrations: 1,
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
