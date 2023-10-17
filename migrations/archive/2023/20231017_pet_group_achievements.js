/* eslint-disable no-console */
const MIGRATION_NAME = '20231017_pet_group_achievements';
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
    if (pets['Armadillo-Base']
      && pets['Armadillo-CottonCandyBlue']
      && pets['Armadillo-CottonCandyPink']
      && pets['Armadillo-Desert']
      && pets['Armadillo-Golden']
      && pets['Armadillo-Red']
      && pets['Armadillo-Shade']
      && pets['Armadillo-Skeleton']
      && pets['Armadillo-White']
      && pets['Armadillo-Zombie']
      && pets['Cactus-Base']
      && pets['Cactus-CottonCandyBlue']
      && pets['Cactus-CottonCandyPink']
      && pets['Cactus-Desert']
      && pets['Cactus-Golden']
      && pets['Cactus-Red']
      && pets['Cactus-Shade']
      && pets['Cactus-Skeleton']
      && pets['Cactus-White']
      && pets['Cactus-Zombie']
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
      && pets['Frog-Base']
      && pets['Frog-CottonCandyBlue']
      && pets['Frog-CottonCandyPink']
      && pets['Frog-Desert']
      && pets['Frog-Golden']
      && pets['Frog-Red']
      && pets['Frog-Shade']
      && pets['Frog-Skeleton']
      && pets['Frog-White']
      && pets['Frog-Zombie']
      && pets['Snake-Base']
      && pets['Snake-CottonCandyBlue']
      && pets['Snake-CottonCandyPink']
      && pets['Snake-Desert']
      && pets['Snake-Golden']
      && pets['Snake-Red']
      && pets['Snake-Shade']
      && pets['Snake-Skeleton']
      && pets['Snake-White']
      && pets['Snake-Zombie']
      && pets['Spider-Base']
      && pets['Spider-CottonCandyBlue']
      && pets['Spider-CottonCandyPink']
      && pets['Spider-Desert']
      && pets['Spider-Golden']
      && pets['Spider-Red']
      && pets['Spider-Shade']
      && pets['Spider-Skeleton']
      && pets['Spider-White']
      && pets['Spider-Zombie']) {
        set['achievements.duneBuddy'] = true;
      }
  }

  if (count % progressCount === 0) console.warn(`${count} ${user._id}`);

  return await User.updateOne({ _id: user._id }, { $set: set }).exec();
}

export default async function processUsers () {
  let query = {
    migration: { $ne: MIGRATION_NAME },
    'auth.timestamps.loggedin': { $gt: new Date('2023-09-16') },
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
