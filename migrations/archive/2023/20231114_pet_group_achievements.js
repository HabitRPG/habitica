/* eslint-disable no-console */
const MIGRATION_NAME = '20231114_pet_group_achievements';
import { model as User } from '../../../website/server/models/user';

const progressCount = 1000;
let count = 0;

async function updateUser (user) {
  count++;

  let set = {
    migration: MIGRATION_NAME,
  };

  if (user && user.items && user.items.pets) {
    const pets = user.items.pets;
    if (pets['Cactus-Zombie'] > 0
      && pets['Cactus-Skeleton'] > 0
      && pets['Cactus-Base'] > 0
      && pets['Cactus-Desert'] > 0
      && pets['Cactus-Red'] > 0
      && pets['Cactus-Shade'] > 0
      && pets['Cactus-White']> 0
      && pets['Cactus-Golden'] > 0
      && pets['Cactus-CottonCandyBlue'] > 0
      && pets['Cactus-CottonCandyPink'] > 0
      && pets['Hedgehog-Zombie'] > 0
      && pets['Hedgehog-Skeleton'] > 0
      && pets['Hedgehog-Base'] > 0
      && pets['Hedgehog-Desert'] > 0
      && pets['Hedgehog-Red'] > 0
      && pets['Hedgehog-Shade'] > 0
      && pets['Hedgehog-White'] > 0
      && pets['Hedgehog-Golder'] > 0
      && pets['Hedgehog-CottonCandyBlue'] > 0
      && pets['Hedgehog-CottonCandyPink'] > 0
      && pets['Rock-Zombie'] > 0
      && pets['Rock-Skeleton'] > 0
      && pets['Rock-Base'] > 0
      && pets['Rock-Desert'] > 0
      && pets['Rock-Red'] > 0
      && pets['Rock-Shade'] > 0
      && pets['Rock-White'] > 0
      && pets['Rock-Golden'] > 0
      && pets['Rock-CottonCandyBlue'] > 0
      && pets['Rock-CottonCandyPink'] > 0 ) {
        set['achievements.roughRider'] = true;
      }
  }

  if (user && user.items && user.items.mounts) {
    const mounts = user.items.mounts;
    if (mounts['Cactus-Zombie']
      && mounts['Cactus-Skeleton']
      && mounts['Cactus-Base']
      && mounts['Cactus-Desert']
      && mounts['Cactus-Red']
      && mounts['Cactus-Shade']
      && mounts['Cactus-White']
      && mounts['Cactus-Golden']
      && mounts['Cactus-CottonCandyPink']
      && mounts['Cactus-CottonCandyBlue']
      && mounts['Hedgehog-Zombie']
      && mounts['Hedgehog-Skeleton']
      && mounts['Hedgehog-Base']
      && mounts['Hedgehog-Desert']
      && mounts['Hedgehog-Red']
      && mounts['Hedgehog-Shade']
      && mounts['Hedgehog-White']
      && mounts['Hedgehog-Golden']
      && mounts['Hedgehog-CottonCandyPink']
      && mounts['Hedgehog-CottonCandyBlue']
      && mounts['Rock-Zombie']
      && mounts['Rock-Skeleton']
      && mounts['Rock-Base']
      && mounts['Rock-Desert']
      && mounts['Rock-Red']
      && mounts['Rock-Shade']
      && mounts['Rock-White']
      && mounts['Rock-Golden']
      && mounts['Rock-CottonCandyPink']
      && mounts['Rock-CottonCandyBlue'] ) {
        set['achievements.roughRider'] = true;
      }
  }

  if (count % progressCount === 0) console.warn(`${count} ${user._id}`);

  return await User.update({ _id: user._id }, { $set: set }).exec();
}

module.exports = async function processUsers () {
  let query = {
    migration: { $ne: MIGRATION_NAME },
    'auth.timestamps.loggedin': { $gt: new Date('2023-02-01') },
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
