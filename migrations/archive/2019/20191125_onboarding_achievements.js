/*
 * Award Onboarding Achievements for existing users
 */
/* eslint-disable no-console */

import { model as User } from '../../website/server/models/user';

const MIGRATION_NAME = '20191218_onboarding_achievements';

const progressCount = 1000;
let count = 0;

async function updateUser (user) {
  count += 1;

  const set = {};

  set.migration = MIGRATION_NAME;

  const hasPet = Object.keys(user.items.pets).find(petKey => {
    const pet = user.items.pets[petKey];

    if (pet >= 5) return true;
    return false;
  });

  if (hasPet) {
    set['achievements.hatchedPet'] = true;
  }

  const hasFedPet = Object.keys(user.items.pets).find(petKey => {
    const pet = user.items.pets[petKey];

    if (pet > 5) return true;
    return false;
  });

  if (hasFedPet) {
    set['achievements.fedPet'] = true;
  }

  const hasGear = Object.keys(user.items.gear.owned).find(gearKey => {
    const gear = user.items.gear.owned[gearKey];

    if (gear === true && gearKey.indexOf('_special_') === -1) return true;
    return false;
  });

  if (hasGear) {
    set['achievements.purchasedEquipment'] = true;
  }

  if (user.tasksOrder) {
    const hasTask = Object.keys(user.tasksOrder).find(tasksOrderType => {
      const order = user.tasksOrder[tasksOrderType];

      if (order && order.length > 0) return true;
      return false;
    });

    if (hasTask) {
      set['achievements.createdTask'] = true;
    }

    const hasExperience = user.stats && user.stats.exp && user.stats.exp > 0;
    if (hasTask && hasExperience) {
      set['achievements.completedTask'] = true;
    }
  }

  if (count % progressCount === 0) console.warn(`${count} ${user._id}`);
  return User.update({ _id: user._id }, { $set: set }).exec();
}

module.exports = async function processUsers () { // eslint-disable-line import/no-commonjs
  const query = {
    migration: { $ne: MIGRATION_NAME },
  };

  const fields = {
    _id: 1,
    stats: 1,
    items: 1,
    achievements: 1,
    tasksOrder: 1,
  };

  while (true) { // eslint-disable-line no-constant-condition
    const users = await User // eslint-disable-line no-await-in-loop
      .find(query)
      .limit(100)
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
};
