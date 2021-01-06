/* eslint-disable no-console */
const MIGRATION_NAME = '20201124_pet_color_achievements';
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
    if (pets['Wolf-Red'] > 0
      && pets['TigerCub-Red'] > 0
      && pets['PandaCub-Red'] > 0
      && pets['LionCub-Red'] > 0
      && pets['Fox-Red'] > 0
      && pets['FlyingPig-Red'] > 0
      && pets['Dragon-Red'] > 0
      && pets['Cactus-Red'] > 0
      && pets['BearCub-Red'] > 0) {
        set['achievements.seeingRed'] = true;
      }
  }

  if (user && user.items && user.items.mounts) {
    const mounts = user.items.mounts;
    if (mounts['Wolf-Red']
      && mounts['TigerCub-Red']
      && mounts['PandaCub-Red']
      && mounts['LionCub-Red']
      && mounts['Fox-Red']
      && mounts['FlyingPig-Red']
      && mounts['Dragon-Red']
      && mounts['Cactus-Red']
      && mounts['BearCub-Red'] ) {
        set['achievements.redLetterDay'] = true;
      }
  }

  if (count % progressCount === 0) console.warn(`${count} ${user._id}`);

  return await User.update({ _id: user._id }, { $set: set }).exec();
}

module.exports = async function processUsers () {
  let query = {
    migration: { $ne: MIGRATION_NAME },
    'auth.timestamps.loggedin': { $gt: new Date('2020-11-01') },
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
