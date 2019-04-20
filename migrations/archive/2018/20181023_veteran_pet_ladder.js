/* eslint-disable no-console */
const MIGRATION_NAME = '20181023_veteran_pet_ladder';
import { model as User } from '../../website/server/models/user';

const progressCount = 1000;
let count = 0;

async function updateUser (user) {
  count++;

  const set = {};

  set.migration = MIGRATION_NAME;

  if (user.items.pets['Bear-Veteran']) {
    set['items.pets.Fox-Veteran'] = 5;
  } else if (user.items.pets['Lion-Veteran']) {
    set['items.pets.Bear-Veteran'] = 5;
  } else if (user.items.pets['Tiger-Veteran']) {
    set['items.pets.Lion-Veteran'] = 5;
  } else if (user.items.pets['Wolf-Veteran']) {
    set['items.pets.Tiger-Veteran'] = 5;
  } else {
    set['items.pets.Wolf-Veteran'] = 5;
  }

  if (count % progressCount === 0) console.warn(`${count} ${user._id}`);

  return await User.update({_id: user._id}, {$set: set}).exec();
}

module.exports = async function processUsers () {
  let query = {
    migration: {$ne: MIGRATION_NAME},
    'flags.verifiedUsername': true,
  };

  const fields = {
    _id: 1,
    items: 1,
    migration: 1,
    flags: 1,
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
