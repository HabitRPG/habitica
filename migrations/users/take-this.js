/* eslint-disable no-console */
import { v4 as uuid } from 'uuid';
import { model as User } from '../../website/server/models/user';

const MIGRATION_NAME = '20190902_take_this';
const progressCount = 1000;
let count = 0;

async function updateUser (user) {
  count += 1;

  let set;

  let migrationsArray = user.migrations;
  if (migrationsArray.length > 4) {
    migrationsArray = migrationsArray.slice(1);
  }

  const newMigration = {
    name: MIGRATION_NAME,
    processed: new Date(),
    data: {
      item: '',
    },
  };

  let push;
  if (typeof user.items.gear.owned.back_special_takeThis !== 'undefined') {
    push = false;
  } else if (typeof user.items.gear.owned.body_special_takeThis !== 'undefined') {
    set['items.gear.owned.back_special_takeThis'] = false;
    newMigration.data.item = 'back_special_takeThis';
    push = { pinnedItems: { type: 'marketGear', path: 'gear.flat.back_special_takeThis', _id: uuid() } };
  } else if (typeof user.items.gear.owned.head_special_takeThis !== 'undefined') {
    set['items.gear.owned.body_special_takeThis'] = false;
    newMigration.data.item = 'body_special_takeThis';
    push = { pinnedItems: { type: 'marketGear', path: 'gear.flat.body_special_takeThis', _id: uuid() } };
  } else if (typeof user.items.gear.owned.armor_special_takeThis !== 'undefined') {
    set['items.gear.owned.head_special_takeThis'] = false;
    newMigration.data.item = 'head_special_takeThis';
    push = { pinnedItems: { type: 'marketGear', path: 'gear.flat.head_special_takeThis', _id: uuid() } };
  } else if (typeof user.items.gear.owned.weapon_special_takeThis !== 'undefined') {
    set['items.gear.owned.armor_special_takeThis'] = false;
    newMigration.data.item = 'armor_special_takeThis';
    push = { pinnedItems: { type: 'marketGear', path: 'gear.flat.armor_special_takeThis', _id: uuid() } };
  } else if (typeof user.items.gear.owned.shield_special_takeThis !== 'undefined') {
    set['items.gear.owned.weapon_special_takeThis'] = false;
    newMigration.data.item = 'weapon_special_takeThis';
    push = { pinnedItems: { type: 'marketGear', path: 'gear.flat.weapon_special_takeThis', _id: uuid() } };
  } else {
    set['items.gear.owned.shield_special_takeThis'] = false;
    newMigration.data.item = 'shield_special_takeThis';
    push = { pinnedItems: { type: 'marketGear', path: 'gear.flat.shield_special_takeThis', _id: uuid() } };
  }

  migrationsArray.push(newMigration);
  set.migrations = migrationsArray;

  if (count % progressCount === 0) console.warn(`${count} ${user._id}`);

  if (push) {
    return User.update({ _id: user._id }, { $set: set, $push: push }).exec();
  }
  return User.update({ _id: user._id }, { $set: set }).exec();
}

export default async function processUsers () {
  const query = {
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
      .sort({ _id: 1 })
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
}
