/* eslint-disable no-console */
const MIGRATION_NAME = '20220524_pet_group_achievements';
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
    if (pets['Alligator-Base']
      && pets['Alligator-CottonCandyBlue']
      && pets['Alligator-CottonCandyPink']
      && pets['Alligator-Desert']
      && pets['Alligator-Golden']
      && pets['Alligator-Red']
      && pets['Alligator-Shade']
      && pets['Alligator-Skeleton']
      && pets['Alligator-White']
      && pets['Alligator-Zombie']
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
      && pets['Triceratops-Base']
      && pets['Triceratops-CottonCandyBlue']
      && pets['Triceratops-CottonCandyPink']
      && pets['Triceratops-Desert']
      && pets['Triceratops-Golden']
      && pets['Triceratops-Red']
      && pets['Triceratops-Shade']
      && pets['Triceratops-Skeleton']
      && pets['Triceratops-White']
      && pets['Triceratops-Zombie']
      && pets['TRex-Base']
      && pets['TRex-CottonCandyBlue']
      && pets['TRex-CottonCandyPink']
      && pets['TRex-Desert']
      && pets['TRex-Golden']
      && pets['TRex-Red']
      && pets['TRex-Shade']
      && pets['TRex-Skeleton']
      && pets['TRex-White']
      && pets['TRex-Zombie']
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
      && pets['Turtle-Base']
      && pets['Turtle-CottonCandyBlue']
      && pets['Turtle-CottonCandyPink']
      && pets['Turtle-Desert']
      && pets['Turtle-Golden']
      && pets['Turtle-Red']
      && pets['Turtle-Shade']
      && pets['Turtle-Skeleton']
      && pets['Turtle-White']
      && pets['Turtle-Zombie']
      && pets['Velociraptor-Base']
      && pets['Velociraptor-CottonCandyBlue']
      && pets['Velociraptor-CottonCandyPink']
      && pets['Velociraptor-Desert']
      && pets['Velociraptor-Golden']
      && pets['Velociraptor-Red']
      && pets['Velociraptor-Shade']
      && pets['Velociraptor-Skeleton']
      && pets['Velociraptor-White']
      && pets['Velociraptor-Zombie']) {
        set['achievements.reptacularRumble'] = true;
      }
  }

  if (count % progressCount === 0) console.warn(`${count} ${user._id}`);

  return await User.update({ _id: user._id }, { $set: set }).exec();
}

export default async function processUsers () {
  let query = {
    // migration: { $ne: MIGRATION_NAME },
    'auth.timestamps.loggedin': { $gt: new Date('2022-01-01') },
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
