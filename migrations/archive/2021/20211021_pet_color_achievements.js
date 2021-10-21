/* eslint-disable no-console */
const MIGRATION_NAME = '20211021_pet_color_achievements';
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
    if (pets['Wolf-Shade'] > 0
      && pets['TigerCub-Shade'] > 0
      && pets['PandaCub-Shade'] > 0
      && pets['LionCub-Shade'] > 0
      && pets['Fox-Shade'] > 0
      && pets['FlyingPig-Shade'] > 0
      && pets['Dragon-Shade'] > 0
      && pets['Cactus-Shade'] > 0
      && pets['BearCub-Shade'] > 0) {
        set['achievements.shadyCustomer'] = true;
      }
  }

  if (user && user.items && user.items.mounts) {
    const mounts = user.items.mounts;
    if (mounts['Wolf-Shade']
      && mounts['TigerCub-Shade']
      && mounts['PandaCub-Shade']
      && mounts['LionCub-Shade']
      && mounts['Fox-Shade']
      && mounts['FlyingPig-Shade']
      && mounts['Dragon-Shade']
      && mounts['Cactus-Shade']
      && mounts['BearCub-Shade'] ) {
        set['achievements.shadeOfItAll'] = true;
      }
  }

  if (count % progressCount === 0) console.warn(`${count} ${user._id}`);

  return await User.update({ _id: user._id }, { $set: set }).exec();
}

export default async function processUsers () {
  let query = {
    migration: { $ne: MIGRATION_NAME },
    'auth.timestamps.loggedin': { $gt: new Date('2021-10-01') },
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
