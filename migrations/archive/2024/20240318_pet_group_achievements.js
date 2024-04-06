/* eslint-disable no-console */
const MIGRATION_NAME = '202403_pet_group_achievements';
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
    if (pets['GuineaPig-Zombie'] > 0
      && pets['GuineaPig-Skeleton'] > 0
      && pets['GuineaPig-Base'] > 0
      && pets['GuineaPig-Desert'] > 0
      && pets['GuineaPig-Red'] > 0
      && pets['GuineaPig-Shade'] > 0
      && pets['GuineaPig-White']> 0
      && pets['GuineaPig-Golden'] > 0
      && pets['GuineaPig-CottonCandyBlue'] > 0
      && pets['GuineaPig-CottonCandyPink'] > 0
      && pets['Squirrel-Zombie'] > 0
      && pets['Squirrel-Skeleton'] > 0
      && pets['Squirrel-Base'] > 0
      && pets['Squirrel-Desert'] > 0
      && pets['Squirrel-Red'] > 0
      && pets['Squirrel-Shade'] > 0
      && pets['Squirrel-White'] > 0
      && pets['Squirrel-Golden'] > 0
      && pets['Squirrel-CottonCandyBlue'] > 0
      && pets['Squirrel-CottonCandyPink'] > 0
      && pets['Rat-Zombie'] > 0
      && pets['Rat-Skeleton'] > 0
      && pets['Rat-Base'] > 0
      && pets['Rat-Desert'] > 0
      && pets['Rat-Red'] > 0
      && pets['Rat-Shade'] > 0
      && pets['Rat-White'] > 0
      && pets['Rat-Golden'] > 0
      && pets['Rat-CottonCandyBlue'] > 0
      && pets['Rat-CottonCandyPink'] > 0 ) {
        set['achievements.rodentRuler'] = true;
      
    }
  }

  if (count % progressCount === 0) console.warn(`${count} ${user._id}`);

  return await User.updateOne({ _id: user._id }, { $set: set }).exec();
}

export default async function processUsers () {
  let query = {
    migration: { $ne: MIGRATION_NAME },
    'auth.timestamps.loggedin': { $gt: new Date('2024-02-01') },
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
