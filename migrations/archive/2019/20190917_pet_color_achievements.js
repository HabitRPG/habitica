/* eslint-disable no-console */
const MIGRATION_NAME = '20190917_pet_color_achievements';
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
    if (pets['Wolf-Base'] > 0
      && pets['TigerCub-Base'] > 0
      && pets['PandaCub-Base'] > 0
      && pets['LionCub-Base'] > 0
      && pets['Fox-Base'] > 0
      && pets['FlyingPig-Base'] > 0
      && pets['Dragon-Base'] > 0
      && pets['Cactus-Base'] > 0
      && pets['BearCub-Base'] > 0) {
        set['achievements.backToBasics'] = true;
      }
    if (pets['Wolf-Desert'] > 0
      && pets['TigerCub-Desert'] > 0
      && pets['PandaCub-Desert'] > 0
      && pets['LionCub-Desert'] > 0
      && pets['Fox-Desert'] > 0
      && pets['FlyingPig-Desert'] > 0
      && pets['Dragon-Desert'] > 0
      && pets['Cactus-Desert'] > 0
      && pets['BearCub-Desert'] > 0) {
        set['achievements.dustDevil'] = true;
      }
  }

  if (user && user.items && user.items.mounts) {
    const mounts = user.items.mounts;
    if (mounts['Wolf-Base']
      && mounts['TigerCub-Base']
      && mounts['PandaCub-Base']
      && mounts['LionCub-Base']
      && mounts['Fox-Base']
      && mounts['FlyingPig-Base']
      && mounts['Dragon-Base']
      && mounts['Cactus-Base']
      && mounts['BearCub-Base'] ) {
        set['achievements.allYourBase'] = true;
      }
    if (mounts['Wolf-Desert']
      && mounts['TigerCub-Desert']
      && mounts['PandaCub-Desert']
      && mounts['LionCub-Desert']
      && mounts['Fox-Desert']
      && mounts['FlyingPig-Desert']
      && mounts['Dragon-Desert']
      && mounts['Cactus-Desert']
      && mounts['BearCub-Desert'] ) {
        set['achievements.aridAuthority'] = true;
      }
  }

  if (count % progressCount === 0) console.warn(`${count} ${user._id}`);

  return await User.update({ _id: user._id }, { $set: set }).exec();
}

module.exports = async function processUsers () {
  let query = {
    migration: { $ne: MIGRATION_NAME },
    'auth.timestamps.loggedin': { $gt: new Date('2019-09-01') },
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
