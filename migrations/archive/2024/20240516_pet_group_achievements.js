/* eslint-disable no-console */
const MIGRATION_NAME = '202405_pet_group_achievements';
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
    if (pets['LionCub-Zombie'] > 0
      && pets['LionCub-Skeleton'] > 0
      && pets['LionCub-Base'] > 0
      && pets['LionCub-Desert'] > 0
      && pets['LionCub-Red'] > 0
      && pets['LionCub-Shade'] > 0
      && pets['LionCub-White']> 0
      && pets['LionCub-Golden'] > 0
      && pets['LionCub-CottonCandyBlue'] > 0
      && pets['LionCub-CottonCandyPink'] > 0
      && pets['TigerCub-Zombie'] > 0
      && pets['TigerCub-Skeleton'] > 0
      && pets['TigerCub-Base'] > 0
      && pets['TigerCub-Desert'] > 0
      && pets['TigerCub-Red'] > 0
      && pets['TigerCub-Shade'] > 0
      && pets['TigerCub-White'] > 0
      && pets['TigerCub-Golden'] > 0
      && pets['TigerCub-CottonCandyBlue'] > 0
      && pets['TigerCub-CottonCandyPink'] > 0
      && pets['Sabretooth-Zombie'] > 0
      && pets['Sabretooth-Skeleton'] > 0
      && pets['Sabretooth-Base'] > 0
      && pets['Sabretooth-Desert'] > 0
      && pets['Sabretooth-Red'] > 0
      && pets['Sabretooth-Shade'] > 0
      && pets['Sabretooth-White'] > 0
      && pets['Sabretooth-Golden'] > 0
      && pets['Sabretooth-CottonCandyBlue'] > 0
      && pets['Sabretooth-CottonCandyPink'] > 0 
      && pets['Cheetah-Zombie'] > 0
      && pets['Cheetah-Skeleton'] > 0
      && pets['Cheetah-Base'] > 0
      && pets['Cheetah-Desert'] > 0
      && pets['Cheetah-Red'] > 0
      && pets['Cheetah-Shade'] > 0
      && pets['Cheetah-White'] > 0
      && pets['Cheetah-Golden'] > 0
      && pets['Cheetah-CottonCandyBlue'] > 0
      && pets['Cheetah-CottonCandyPink'] > 0 ) {
        set['achievements.cats'] = true;
      
    }
  }

  if (count % progressCount === 0) console.warn(`${count} ${user._id}`);

  return await User.updateOne({ _id: user._id }, { $set: set }).exec();
}

export default async function processUsers () {
  let query = {
    migration: { $ne: MIGRATION_NAME },
    'auth.timestamps.loggedin': { $gt: new Date('2024-03-01') },
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
