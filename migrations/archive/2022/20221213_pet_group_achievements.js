/* eslint-disable no-console */
const MIGRATION_NAME = '20221213_pet_group_achievements';
import { model as User } from '../../../website/server/models/user';

const progressCount = 1000;
let count = 0;

async function updateUser (user) {
  count++;

  const set = {
    migration: MIGRATION_NAME,
  };

  if (user && user.items && user.items.pets) {
    const pets = user.items.pets;
    if (pets['BearCub-Base']
      && pets['BearCub-CottonCandyBlue']
      && pets['BearCub-CottonCandyPink']
      && pets['BearCub-Desert']
      && pets['BearCub-Golden']
      && pets['BearCub-Red']
      && pets['BearCub-Shade']
      && pets['BearCub-Skeleton']
      && pets['BearCub-White']
      && pets['BearCub-Zombie']
      && pets['Fox-Base']
      && pets['Fox-CottonCandyBlue']
      && pets['Fox-CottonCandyPink']
      && pets['Fox-Desert']
      && pets['Fox-Golden']
      && pets['Fox-Red']
      && pets['Fox-Shade']
      && pets['Fox-Skeleton']
      && pets['Fox-White']
      && pets['Fox-Zombie']
      && pets['Penguin-Base']
      && pets['Penguin-CottonCandyBlue']
      && pets['Penguin-CottonCandyPink']
      && pets['Penguin-Desert']
      && pets['Penguin-Golden']
      && pets['Penguin-Red']
      && pets['Penguin-Shade']
      && pets['Penguin-Skeleton']
      && pets['Penguin-White']
      && pets['Penguin-Zombie']
      && pets['Whale-Base']
      && pets['Whale-CottonCandyBlue']
      && pets['Whale-CottonCandyPink']
      && pets['Whale-Desert']
      && pets['Whale-Golden']
      && pets['Whale-Red']
      && pets['Whale-Shade']
      && pets['Whale-Skeleton']
      && pets['Whale-White']
      && pets['Whale-Zombie']
      && pets['Wolf-Base']
      && pets['Wolf-CottonCandyBlue']
      && pets['Wolf-CottonCandyPink']
      && pets['Wolf-Desert']
      && pets['Wolf-Golden']
      && pets['Wolf-Red']
      && pets['Wolf-Shade']
      && pets['Wolf-Skeleton']
      && pets['Wolf-White']
      && pets['Wolf-Zombie'] {
        set['achievements.polarPro'] = true;
      }
  }

  if (count % progressCount === 0) console.warn(`${count} ${user._id}`);

  return await User.update({ _id: user._id }, { $set: set }).exec();
}

export default async function processUsers () {
  let query = {
    // migration: { $ne: MIGRATION_NAME },
    'auth.timestamps.loggedin': { $gt: new Date('2022-11-01') },
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
        $gt: users[users.length - 1]._id,
      };
    }

    await Promise.all(users.map(updateUser)); // eslint-disable-line no-await-in-loop
  }
};
