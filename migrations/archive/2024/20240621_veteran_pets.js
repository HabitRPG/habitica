/* eslint-disable no-console */
const MIGRATION_NAME = '20240621_veteran_pet_ladder';
import { model as User } from '../../../website/server/models/user';

const progressCount = 1000;
let count = 0;

async function updateUser (user) {
  count++;

  const set = {};
  let push = { notifications: { $each: [] }};

  set.migration = MIGRATION_NAME;
  if (user.items.pets['Dragon-Veteran']) {
    set['items.pets.Cactus-Veteran'] = 5;
    push.notifications.$each.push({
      type: 'ITEM_RECEIVED',
      data: {
        icon: 'icon_pet_veteran_cactus',
        title: 'You’ve received a Veteran Pet!',
        text: 'To commemorate being here for a new era of Habitica, we’ve awarded you a Veteran Cactus and 24 Gems!',
        destination: '/inventory/stable',
      },
      seen: false,
    });
  } else if (user.items.pets['Fox-Veteran']) {
    set['items.pets.Dragon-Veteran'] = 5;
    push.notifications.$each.push({
      type: 'ITEM_RECEIVED',
      data: {
        icon: 'icon_pet_veteran_dragon',
        title: 'You’ve received a Veteran Pet!',
        text: 'To commemorate being here for a new era of Habitica, we’ve awarded you a Veteran Dragon and 24 Gems!',
        destination: '/inventory/stable',
      },
      seen: false,
    });
  } else if (user.items.pets['Bear-Veteran']) {
    set['items.pets.Fox-Veteran'] = 5;
    push.notifications.$each.push({
      type: 'ITEM_RECEIVED',
      data: {
        icon: 'icon_pet_veteran_fox',
        title: 'You’ve received a Veteran Pet!',
        text: 'To commemorate being here for a new era of Habitica, we’ve awarded you a Veteran Fox and 24 Gems!',
        destination: '/inventory/stable',
      },
      seen: false,
    });
  } else if (user.items.pets['Lion-Veteran']) {
    set['items.pets.Bear-Veteran'] = 5;
    push.notifications.$each.push({
      type: 'ITEM_RECEIVED',
      data: {
        icon: 'icon_pet_veteran_bear',
        title: 'You’ve received a Veteran Pet!',
        text: 'To commemorate being here for a new era of Habitica, we’ve awarded you a Veteran Bear and 24 Gems!',
        destination: '/inventory/stable',
      },
      seen: false,
    });
  } else if (user.items.pets['Tiger-Veteran']) {
    set['items.pets.Lion-Veteran'] = 5;
    push.notifications.$each.push({
      type: 'ITEM_RECEIVED',
      data: {
        icon: 'icon_pet_veteran_lion',
        title: 'You’ve received a Veteran Pet!',
        text: 'To commemorate being here for a new era of Habitica, we’ve awarded you a Veteran Lion and 24 Gems!',
        destination: '/inventory/stable',
      },
      seen: false,
    });
  } else if (user.items.pets['Wolf-Veteran']) {
    set['items.pets.Tiger-Veteran'] = 5;
    push.notifications.$each.push({
      type: 'ITEM_RECEIVED',
      data: {
        icon: 'icon_pet_veteran_tiger',
        title: 'You’ve received a Veteran Pet!',
        text: 'To commemorate being here for a new era of Habitica, we’ve awarded you a Veteran Tiger and 24 Gems!',
        destination: '/inventory/stable',
      },
      seen: false,
    });
  } else {
    set['items.pets.Wolf-Veteran'] = 5;
    push.notifications.$each.push({
      type: 'ITEM_RECEIVED',
      data: {
        icon: 'icon_pet_veteran_wolf',
        title: 'You’ve received a Veteran Pet!',
        text: 'To commemorate being here for a new era of Habitica, we’ve awarded you a Veteran Wolf and 24 Gems!',
        destination: '/inventory/stable',
      },
      seen: false,
    });
  }

  if (count % progressCount === 0) console.warn(`${count} ${user._id}`);

  await user.updateBalance(
    6,
    'admin_update_balance',
    '',
    'Veteran Ladder award',
  );

  return await User.updateOne(
    { _id: user._id },
    { $set: set, $push: push, $inc: { balance: 6 } },
  ).exec();
}

export default async function processUsers () {
  let query = {
    migration: {$ne: MIGRATION_NAME},
    'auth.timestamps.loggedin': { $gt: new Date('2024-05-21') },
  };

  const fields = {
    _id: 1,
    items: 1,
    migration: 1,
    contributor: 1,
  };

  while (true) { // eslint-disable-line no-constant-condition
    const users = await User // eslint-disable-line no-await-in-loop
      .find(query)
      .limit(250)
      .sort({_id: 1})
      .select(fields)
      .exec();

    if (users.length === 0) {
      console.warn('All appropriate users found and modified.');
      console.warn(`\n${count} users processed\n`);
      break;
    } else {
      query._id = {
        $gt: users[users.length - 1],
      };
    }

    await Promise.all(users.map(updateUser)); // eslint-disable-line no-await-in-loop
  }
};
