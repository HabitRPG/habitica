/* eslint-disable no-console */
const MIGRATION_NAME = '20220309_pet_group_achievements';
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
      && pets['Owl-Base']
      && pets['Owl-CottonCandyBlue']
      && pets['Owl-CottonCandyPink']
      && pets['Owl-Desert']
      && pets['Owl-Golden']
      && pets['Owl-Red']
      && pets['Owl-Shade']
      && pets['Owl-Skeleton']
      && pets['Owl-White']
      && pets['Owl-Zombie']
      && pets['Parrot-Base']
      && pets['Parrot-CottonCandyBlue']
      && pets['Parrot-CottonCandyPink']
      && pets['Parrot-Desert']
      && pets['Parrot-Golden']
      && pets['Parrot-Red']
      && pets['Parrot-Shade']
      && pets['Parrot-Skeleton']
      && pets['Parrot-White']
      && pets['Parrot-Zombie']
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
      && pets['Pterodactyl-Base']
      && pets['Pterodactyl-CottonCandyBlue']
      && pets['Pterodactyl-CottonCandyPink']
      && pets['Pterodactyl-Desert']
      && pets['Pterodactyl-Golden']
      && pets['Pterodactyl-Red']
      && pets['Pterodactyl-Shade']
      && pets['Pterodactyl-Skeleton']
      && pets['Pterodactyl-White']
      && pets['Pterodactyl-Zombie']
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
      && pets['Falcon-Base']
      && pets['Falcon-CottonCandyBlue']
      && pets['Falcon-CottonCandyPink']
      && pets['Falcon-Desert']
      && pets['Falcon-Golden']
      && pets['Falcon-Red']
      && pets['Falcon-Shade']
      && pets['Falcon-Skeleton']
      && pets['Falcon-White']
      && pets['Falcon-Zombie']
      && pets['Peacock-Base']
      && pets['Peacock-CottonCandyBlue']
      && pets['Peacock-CottonCandyPink']
      && pets['Peacock-Desert']
      && pets['Peacock-Golden']
      && pets['Peacock-Red']
      && pets['Peacock-Shade']
      && pets['Peacock-Skeleton']
      && pets['Peacock-White']
      && pets['Peacock-Zombie']) {
        set['achievements.birdsOfAFeather'] = true;
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
