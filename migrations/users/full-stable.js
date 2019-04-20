/* eslint-disable no-console */
const MIGRATION_NAME = 'full-stable';
import each from 'lodash/each';
import keys from 'lodash/keys';
import content from '../../website/common/script/content/index';

import { model as User } from '../../website/server/models/user';

const progressCount = 1000;
let count = 0;

/*
 * Award users every extant pet and mount
 */

async function updateUser (user) {
  count++;

  const set = {};

  set.migration = MIGRATION_NAME;

  each(keys(content.pets), (pet) => {
    set[`items.pets.${pet}`] = 5;
  });
  each(keys(content.premiumPets), (pet) => {
    set[`items.pets.${pet}`] = 5;
  });
  each(keys(content.questPets), (pet) => {
    set[`items.pets.${pet}`] = 5;
  });
  each(keys(content.specialPets), (pet) => {
    set[`items.pets.${pet}`] = 5;
  });
  each(keys(content.mounts), (mount) => {
    set[`items.mounts.${mount}`] = true;
  });
  each(keys(content.premiumMounts), (mount) => {
    set[`items.mounts.${mount}`] = true;
  });
  each(keys(content.questMounts), (mount) => {
    set[`items.mounts.${mount}`] = true;
  });
  each(keys(content.specialMounts), (mount) => {
    set[`items.mounts.${mount}`] = true;
  });

  if (count % progressCount === 0) console.warn(`${count} ${user._id}`);

  return await User.update({_id: user._id}, {$set: set}).exec();
}

module.exports = async function processUsers () {
  let query = {
    migration: {$ne: MIGRATION_NAME},
    'auth.local.username': 'olson22',
  };

  const fields = {
    _id: 1,
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
