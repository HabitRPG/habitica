/* eslint-disable no-console */
import { model as User } from '../../website/server/models/user';

const MIGRATION_NAME = '20230808_veteran_pet_ladder';

const progressCount = 1000;
let count = 0;

async function updateUser (user) {
  count += 1;

  const set = {};
  const push = { notifications: { $each: [] } };

  set.migration = MIGRATION_NAME;
  if (user.items.pets['Fox-Veteran']) {
    set['items.pets.Dragon-Veteran'] = 5;
    push.notifications.$each.push({
      type: 'ITEM_RECEIVED',
      data: {
        icon: 'icon_pet_veteran_dragon',
        title: 'You’ve received a Veteran Pet!',
        text: 'To commemorate being here for a new era of Habitica, we’ve awarded you a Veteran Dragon.',
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
        text: 'To commemorate being here for a new era of Habitica, we’ve awarded you a Veteran Fox.',
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
        text: 'To commemorate being here for a new era of Habitica, we’ve awarded you a Veteran Bear.',
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
        text: 'To commemorate being here for a new era of Habitica, we’ve awarded you a Veteran Lion.',
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
        text: 'To commemorate being here for a new era of Habitica, we’ve awarded you a Veteran Tiger.',
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
        text: 'To commemorate being here for a new era of Habitica, we’ve awarded you a Veteran Wolf.',
        destination: '/inventory/stable',
      },
      seen: false,
    });
  }

  if (user.contributor.level > 0) {
    set['items.gear.owned.armor_special_heroicTunic'] = true;
    set['items.gear.owned.back_special_heroicAureole'] = true;
    set['items.gear.owned.headAccessory_special_heroicCirclet'] = true;
    push.notifications.$each.push({
      type: 'ITEM_RECEIVED',
      data: {
        icon: 'heroic_set_icon',
        title: 'You’ve received the Heroic Set!',
        text: 'To commemorate your hard work as a contributor, we’ve awarded you the Heroic Circlet, Heroic Aureole, and Heroic Tunic.',
        destination: '/inventory/equipment',
      },
      seen: false,
    });
  }

  if (count % progressCount === 0) console.warn(`${count} ${user._id}`);

  // eslint-disable-next-line no-return-await
  return await User.updateOne({ _id: user._id }, { $set: set, $push: push }).exec();
}

export default async function processUsers () {
  const query = {
    migration: { $ne: MIGRATION_NAME },
    'auth.timestamps.loggedin': { $gt: new Date('2023-07-08') },
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
      .sort({ _id: 1 })
      .select(fields)
      .lean()
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
}
