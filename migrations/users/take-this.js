/* eslint-disable no-console */
const MIGRATION_NAME = '20190801_take_this';
import { v4 as uuid } from 'uuid';
import forEach from 'lodash/forEach';
import sortBy from 'lodash/sortBy';

import { model as User } from '../../website/server/models/user';

const progressCount = 1000;
let count = 0;

async function updateUser (user) {
  count++;

  let set = {
    migrations: {},
  };

  let migrationsArray = sortBy(user.migrations, ['processed']);
  if (migrationsArray.length > 4) {
    migrationsArray = migrationsArray.slice(1);
  }
  forEach(migrationsArray, (migration) => {
    set.migrations[migration.name] = migration;
  });

  set.migrations[MIGRATION_NAME] = {
    name: MIGRATION_NAME,
    processed: new Date(),
  };

  let push;
  if (typeof user.items.gear.owned.back_special_takeThis !== 'undefined') {
    push = false;
  } else if (typeof user.items.gear.owned.body_special_takeThis !== 'undefined') {
    set['items.gear.owned.back_special_takeThis'] = false;
    set.migrations[MIGRATION_NAME].item = 'back_special_takeThis';
    push = {pinnedItems: {type: 'marketGear', path: 'gear.flat.back_special_takeThis', _id: uuid()}};
  } else if (typeof user.items.gear.owned.head_special_takeThis !== 'undefined') {
    set['items.gear.owned.body_special_takeThis'] = false;
    set.migrations[MIGRATION_NAME].item = 'body_special_takeThis';
    push = {pinnedItems: {type: 'marketGear', path: 'gear.flat.body_special_takeThis', _id: uuid()}};
  } else if (typeof user.items.gear.owned.armor_special_takeThis !== 'undefined') {
    set['items.gear.owned.head_special_takeThis'] = false;
    set.migrations[MIGRATION_NAME].item = 'head_special_takeThis';
    push = {pinnedItems: {type: 'marketGear', path: 'gear.flat.head_special_takeThis', _id: uuid()}};
  } else if (typeof user.items.gear.owned.weapon_special_takeThis !== 'undefined') {
    set['items.gear.owned.armor_special_takeThis'] = false;
    set.migrations[MIGRATION_NAME].item = 'armor_special_takeThis';
    push = {pinnedItems: {type: 'marketGear', path: 'gear.flat.armor_special_takeThis', _id: uuid()}};
  } else if (typeof user.items.gear.owned.shield_special_takeThis !== 'undefined') {
    set['items.gear.owned.weapon_special_takeThis'] = false;
    set.migrations[MIGRATION_NAME].item = 'weapon_special_takeThis';
    push = {pinnedItems: {type: 'marketGear', path: 'gear.flat.weapon_special_takeThis', _id: uuid()}};
  } else {
    set['items.gear.owned.shield_special_takeThis'] = false;
    set.migrations[MIGRATION_NAME].item = 'shield_special_takeThis';
    push = {pinnedItems: {type: 'marketGear', path: 'gear.flat.shield_special_takeThis', _id: uuid()}};
  }

  if (count % progressCount === 0) console.warn(`${count} ${user._id}`);

  if (push) {
    return await User.update({_id: user._id}, {$set: set, $push: push}).exec();
  } else {
    return await User.update({_id: user._id}, {$set: set}).exec();
  }
}

module.exports = async function processUsers () {
  let query = {
    challenges: '512c4cd1-f440-40f4-8d91-738655cac6e7',
  };
  query[`migrations.${MIGRATION_NAME}`] = {$exists: false};

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
