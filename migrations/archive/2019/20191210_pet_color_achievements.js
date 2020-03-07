/* eslint-disable no-console */
const MIGRATION_NAME = '20191210_pet_color_achievements';
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
    if (pets['Wolf-White'] > 0
      && pets['TigerCub-White'] > 0
      && pets['PandaCub-White'] > 0
      && pets['LionCub-White'] > 0
      && pets['Fox-White'] > 0
      && pets['FlyingPig-White'] > 0
      && pets['Dragon-White'] > 0
      && pets['Cactus-White'] > 0
      && pets['BearCub-White'] > 0) {
        set['achievements.primedForPainting'] = true;
      }
  }

  if (user && user.items && user.items.mounts) {
    const mounts = user.items.mounts;
    if (mounts['Wolf-White']
      && mounts['TigerCub-White']
      && mounts['PandaCub-White']
      && mounts['LionCub-White']
      && mounts['Fox-White']
      && mounts['FlyingPig-White']
      && mounts['Dragon-White']
      && mounts['Cactus-White']
      && mounts['BearCub-White'] ) {
        set['achievements.pearlyPro'] = true;
      }
  }

  if (count % progressCount === 0) console.warn(`${count} ${user._id}`);

  return await User.update({ _id: user._id }, { $set: set }).exec();
}

module.exports = async function processUsers () {
  let query = {
    migration: { $ne: MIGRATION_NAME },
    'auth.timestamps.loggedin': { $gt: new Date('2019-12-01') },
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
