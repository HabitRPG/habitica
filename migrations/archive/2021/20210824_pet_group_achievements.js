/* eslint-disable no-console */
const MIGRATION_NAME = '20210824_pet_group_achievements';
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
    if (pets['FlyingPig-Base']
      && pets['FlyingPig-CottonCandyBlue']
      && pets['FlyingPig-CottonCandyPink']
      && pets['FlyingPig-Desert']
      && pets['FlyingPig-Golden']
      && pets['FlyingPig-Red']
      && pets['FlyingPig-Shade']
      && pets['FlyingPig-Skeleton']
      && pets['FlyingPig-White']
      && pets['FlyingPig-Zombie']
      && pets['Ferret-Base']
      && pets['Ferret-CottonCandyBlue']
      && pets['Ferret-CottonCandyPink']
      && pets['Ferret-Desert']
      && pets['Ferret-Golden']
      && pets['Ferret-Red']
      && pets['Ferret-Shade']
      && pets['Ferret-Skeleton']
      && pets['Ferret-White']
      && pets['Ferret-Zombie']
      && pets['GuineaPig-Base']
      && pets['GuineaPig-CottonCandyBlue']
      && pets['GuineaPig-CottonCandyPink']
      && pets['GuineaPig-Desert']
      && pets['GuineaPig-Golden']
      && pets['GuineaPig-Red']
      && pets['GuineaPig-Shade']
      && pets['GuineaPig-Skeleton']
      && pets['GuineaPig-White']
      && pets['GuineaPig-Zombie']
      && pets['Rooster-Base']
      && pets['Rooster-CottonCandyBlue']
      && pets['Rooster-CottonCandyPink']
      && pets['Rooster-Desert']
      && pets['Rooster-Golden']
      && pets['Rooster-Red']
      && pets['Rooster-Shade']
      && pets['Rooster-Skeleton']
      && pets['Rooster-White']
      && pets['Rooster-Zombie']
      && pets['Rat-Base']
      && pets['Rat-CottonCandyBlue']
      && pets['Rat-CottonCandyPink']
      && pets['Rat-Desert']
      && pets['Rat-Golden']
      && pets['Rat-Red']
      && pets['Rat-Shade']
      && pets['Rat-Skeleton']
      && pets['Rat-White']
      && pets['Rat-Zombie']
      && pets['Bunny-Base']
      && pets['Bunny-CottonCandyBlue']
      && pets['Bunny-CottonCandyPink']
      && pets['Bunny-Desert']
      && pets['Bunny-Golden']
      && pets['Bunny-Red']
      && pets['Bunny-Shade']
      && pets['Bunny-Skeleton']
      && pets['Bunny-White']
      && pets['Bunny-Zombie']
      && pets['Horse-Base']
      && pets['Horse-CottonCandyBlue']
      && pets['Horse-CottonCandyPink']
      && pets['Horse-Desert']
      && pets['Horse-Golden']
      && pets['Horse-Red']
      && pets['Horse-Shade']
      && pets['Horse-Skeleton']
      && pets['Horse-White']
      && pets['Horse-Zombie']
      && pets['Cow-Base']
      && pets['Cow-CottonCandyBlue']
      && pets['Cow-CottonCandyPink']
      && pets['Cow-Desert']
      && pets['Cow-Golden']
      && pets['Cow-Red']
      && pets['Cow-Shade']
      && pets['Cow-Skeleton']
      && pets['Cow-White']
      && pets['Cow-Zombie']) {
        set['achievements.domesticated'] = true;
      }
  }

  if (count % progressCount === 0) console.warn(`${count} ${user._id}`);

  return await User.update({ _id: user._id }, { $set: set }).exec();
}

export default async function processUsers () {
  let query = {
    // migration: { $ne: MIGRATION_NAME },
    'auth.timestamps.loggedin': { $gt: new Date('2021-08-01') },
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
