/* eslint-disable no-console */
const MIGRATION_NAME = 'mystery_items_201907';
const MYSTERY_ITEMS = ['head_mystery_201907', 'armor_mystery_201907', 'eyewear_mystery_201907'];
import { model as User } from '../../website/server/models/user';
import { model as UserNotification } from '../../website/server/models/userNotification';

const progressCount = 1000;
let count = 0;

async function updateUser (user) {
  count++;

  const addToSet = {
    'purchased.plan.mysteryItems': {
      $each: MYSTERY_ITEMS,
    },
  };
  const push = {
    notifications: (new UserNotification({
      type: 'NEW_MYSTERY_ITEMS',
      data: {
        MYSTERY_ITEMS,
      },
    })).toJSON(),
  };
  const set = {
    migration: MIGRATION_NAME,
  };

  if (count % progressCount === 0) console.warn(`${count} ${user._id}`);

  return await User.update({_id: user._id}, {$set: set, $push: push, $addToSet: addToSet}).exec();
}

module.exports = async function processUsers () {
  let query = {
    migration: {$ne: MIGRATION_NAME},
    'purchased.plan.customerId': { $ne: null },
    $or: [
      { 'purchased.plan.dateTerminated': { $gte: new Date() } },
      { 'purchased.plan.dateTerminated': { $exists: false } },
      { 'purchased.plan.dateTerminated': { $eq: null } },
    ],
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
