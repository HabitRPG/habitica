/* eslint-disable no-console */
const MIGRATION_NAME = '20210216_pet_group_achievements';
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
    if (pets['Dragon-Base']
      && pets['Dragon-CottonCandyBlue']
      && pets['Dragon-CottonCandyPink']
      && pets['Dragon-Desert']
      && pets['Dragon-Golden']
      && pets['Dragon-Red']
      && pets['Dragon-Shade']
      && pets['Dragon-Skeleton']
      && pets['Dragon-White']
      && pets['Dragon-Zombie']
      && pets['FlyingPig-Base']
      && pets['FlyingPig-CottonCandyBlue']
      && pets['FlyingPig-CottonCandyPink']
      && pets['FlyingPig-Desert']
      && pets['FlyingPig-Golden']
      && pets['FlyingPig-Red']
      && pets['FlyingPig-Shade']
      && pets['FlyingPig-Skeleton']
      && pets['FlyingPig-White']
      && pets['FlyingPig-Zombie']
      && pets['Gryphon-Base']
      && pets['Gryphon-CottonCandyBlue']
      && pets['Gryphon-CottonCandyPink']
      && pets['Gryphon-Desert']
      && pets['Gryphon-Golden']
      && pets['Gryphon-Red']
      && pets['Gryphon-Shade']
      && pets['Gryphon-Skeleton']
      && pets['Gryphon-White']
      && pets['Gryphon-Zombie']
      && pets['SeaSerpent-Base']
      && pets['SeaSerpent-CottonCandyBlue']
      && pets['SeaSerpent-CottonCandyPink']
      && pets['SeaSerpent-Desert']
      && pets['SeaSerpent-Golden']
      && pets['SeaSerpent-Red']
      && pets['SeaSerpent-Shade']
      && pets['SeaSerpent-Skeleton']
      && pets['SeaSerpent-White']
      && pets['SeaSerpent-Zombie']
      && pets['Unicorn-Base']
      && pets['Unicorn-CottonCandyBlue']
      && pets['Unicorn-CottonCandyPink']
      && pets['Unicorn-Desert']
      && pets['Unicorn-Golden']
      && pets['Unicorn-Red']
      && pets['Unicorn-Shade']
      && pets['Unicorn-Skeleton']
      && pets['Unicorn-White']
      && pets['Unicorn-Zombie']) {
        set['achievements.legendaryBestiary'] = true;
      }
  }

  if (count % progressCount === 0) console.warn(`${count} ${user._id}`);

  return await User.update({ _id: user._id }, { $set: set }).exec();
}

export default async function processUsers () {
  let query = {
    migration: { $ne: MIGRATION_NAME },
    'auth.timestamps.loggedin': { $gt: new Date('2021-02-01') },
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
