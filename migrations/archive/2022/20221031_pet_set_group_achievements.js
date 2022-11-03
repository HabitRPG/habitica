/* eslint-disable no-console */
const MIGRATION_NAME = '20221031_pet_set_group_achievements';
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
    if (pets['Wolf-Skeleton']
      && pets['TigerCub-Skeleton']
      && pets['PandaCub-Skeleton']
      && pets['LionCub-Skeleton']
      && pets['Fox-Skeleton']
      && pets['FlyingPig-Skeleton']
      && pets['Dragon-Skeleton']
      && pets['Cactus-Skeleton']
      && pets['BearCub-Skeleton']
      && pets['Gryphon-Skeleton']
      && pets['Hedgehog-Skeleton']
      && pets['Deer-Skeleton']
      && pets['Egg-Skeleton']
      && pets['Rat-Skeleton']
      && pets['Octopus-Skeleton']
      && pets['Seahorse-Skeleton']
      && pets['Parrot-Skeleton']
      && pets['Rooster-Skeleton']
      && pets['Spider-Skeleton']
      && pets['Owl-Skeleton']
      && pets['Penguin-Skeleton']
      && pets['TRex-Skeleton']
      && pets['Rock-Skeleton']
      && pets['Bunny-Skeleton']
      && pets['Slime-Skeleton']
      && pets['Sheep-Skeleton']
      && pets['Cuttlefish-Skeleton']
      && pets['Whale-Skeleton']
      && pets['Cheetah-Skeleton']
      && pets['Horse-Skeleton']
      && pets['Frog-Skeleton']
      && pets['Snake-Skeleton']
      && pets['Unicorn-Skeleton']
      && pets['Sabretooth-Skeleton']
      && pets['Monkey-Skeleton']
      && pets['Snail-Skeleton']
      && pets['Falcon-Skeleton']
      && pets['Treeling-Skeleton']
      && pets['Axolotl-Skeleton']
      && pets['Turtle-Skeleton']
      && pets['Armadillo-Skeleton']
      && pets['Cow-Skeleton']
      && pets['Beetle-Skeleton']
      && pets['Ferret-Skeleton']
      && pets['Sloth-Skeleton']
      && pets['Triceratops-Skeleton']
      && pets['GuineaPig-Skeleton']
      && pets['Peacock-Skeleton']
      && pets['Butterfly-Skeleton']
      && pets['Nudibranch-Skeleton']
      && pets['Hippo-Skeleton']
      && pets['Yarn-Skeleton']
      && pets['Pterodactyl-Skeleton']
      && pets['Badger-Skeleton']
      && pets['Squirrel-Skeleton']
      && pets['SeaSerpent-Skeleton']
      && pets['Kangaroo-Skeleton']
      && pets['Alligator-Skeleton']
      && pets['Velociraptor-Skeleton']
      && pets['Dolphin-Skeleton']
      && pets['Robot-Skeleton']) {
        set['achievements.boneToPick'] = true;
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
