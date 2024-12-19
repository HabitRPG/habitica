/*
 * Award Habitoween ladder items to participants in this month's Habitoween festivities
 */
/* eslint-disable no-console */
import { model as User } from '../../website/server/models/user';

const MIGRATION_NAME = '20241030_habitoween_ladder'; // Update when running in future years

const progressCount = 1000;
let count = 0;

async function updateUser (user) {
  count += 1;

  const set = { migration: MIGRATION_NAME };
  const inc = {
    'items.food.Candy_Skeleton': 1,
    'items.food.Candy_Base': 1,
    'items.food.Candy_CottonCandyBlue': 1,
    'items.food.Candy_CottonCandyPink': 1,
    'items.food.Candy_Shade': 1,
    'items.food.Candy_White': 1,
    'items.food.Candy_Golden': 1,
    'items.food.Candy_Zombie': 1,
    'items.food.Candy_Desert': 1,
    'items.food.Candy_Red': 1,
  };
  const push = { notifications: { $each: [] } };

  if (user && user.items && user.items.mounts && user.items.mounts['JackOLantern-RoyalPurple']) {
    push.notifications.$each.push({
      type: 'ITEM_RECEIVED',
      data: {
        icon: 'notif_habitoween_candy',
        title: 'Happy Habitoween!',
        text: 'For this spooky celebration, you\'ve received an assortment of candy for your Pets!',
        destination: '/inventory/stable',
      },
      seen: false,
    });
  } else if (user && user.items && user.items.pets && user.items.pets['JackOLantern-RoyalPurple']) {
    set['items.mounts.JackOLantern-RoyalPurple'] = true;
    push.notifications.$each.push({
      type: 'ITEM_RECEIVED',
      data: {
        icon: 'notif_habitoween_purple_mount',
        title: 'Happy Habitoween!',
        text: 'For this spooky celebration, you\'ve received a Royal Purple Jack-O-Lantern Mount and an assortment of candy for your Pets!',
        destination: '/inventory/stable',
      },
      seen: false,
    });
  } else if (user && user.items && user.items.mounts && user.items.mounts['JackOLantern-Glow']) {
    set['items.pets.JackOLantern-RoyalPurple'] = 5;
    push.notifications.$each.push({
      type: 'ITEM_RECEIVED',
      data: {
        icon: 'notif_habitoween_purple_pet',
        title: 'Happy Habitoween!',
        text: 'For this spooky celebration, you\'ve received a Royal Purple Jack-O-Lantern Pet and an assortment of candy for your Pets!',
        destination: '/inventory/stable',
      },
      seen: false,
    });
  } else if (user && user.items && user.items.pets && user.items.pets['JackOLantern-Glow']) {
    set['items.mounts.JackOLantern-Glow'] = true;
    push.notifications.$each.push({
      type: 'ITEM_RECEIVED',
      data: {
        icon: 'notif_habitoween_glow_mount',
        title: 'Happy Habitoween!',
        text: 'For this spooky celebration, you\'ve received a Glow-in-the-Dark Jack-O-Lantern Mount and an assortment of candy for your Pets!',
        destination: '/inventory/stable',
      },
      seen: false,
    });
  } else if (user && user.items && user.items.mounts && user.items.mounts['JackOLantern-Ghost']) {
    set['items.pets.JackOLantern-Glow'] = 5;
    push.notifications.$each.push({
      type: 'ITEM_RECEIVED',
      data: {
        icon: 'notif_habitoween_glow_pet',
        title: 'Happy Habitoween!',
        text: 'For this spooky celebration, you\'ve received a Glow-in-the-Dark Jack-O-Lantern Pet and an assortment of candy for your Pets!',
        destination: '/inventory/stable',
      },
      seen: false,
    });
  } else if (user && user.items && user.items.pets && user.items.pets['JackOLantern-Ghost']) {
    set['items.mounts.JackOLantern-Ghost'] = true;
    push.notifications.$each.push({
      type: 'ITEM_RECEIVED',
      data: {
        icon: 'notif_habitoween_ghost_mount',
        title: 'Happy Habitoween!',
        text: 'For this spooky celebration, you\'ve received a Ghost Jack-O-Lantern Mount and an assortment of candy for your Pets!',
        destination: '/inventory/stable',
      },
      seen: false,
    });
  } else if (user && user.items && user.items.mounts && user.items.mounts['JackOLantern-Base']) {
    set['items.pets.JackOLantern-Ghost'] = 5;
    push.notifications.$each.push({
      type: 'ITEM_RECEIVED',
      data: {
        icon: 'notif_habitoween_ghost_pet',
        title: 'Happy Habitoween!',
        text: 'For this spooky celebration, you\'ve received a Ghost Jack-O-Lantern Pet and an assortment of candy for your Pets!',
        destination: '/inventory/stable',
      },
      seen: false,
    });
  } else if (user && user.items && user.items.pets && user.items.pets['JackOLantern-Base']) {
    set['items.mounts.JackOLantern-Base'] = true;
    push.notifications.$each.push({
      type: 'ITEM_RECEIVED',
      data: {
        icon: 'notif_habitoween_base_mount',
        title: 'Happy Habitoween!',
        text: 'For this spooky celebration, you\'ve received a Jack-O-Lantern Mount and an assortment of candy for your Pets!',
        destination: '/inventory/stable',
      },
      seen: false,
    });
  } else {
    set['items.pets.JackOLantern-Base'] = 5;
    push.notifications.$each.push({
      type: 'ITEM_RECEIVED',
      data: {
        icon: 'notif_habitoween_base_pet',
        title: 'Happy Habitoween!',
        text: 'For this spooky celebration, you\'ve received a Jack-O-Lantern Pet and an assortment of candy for your Pets!',
        destination: '/inventory/stable',
      },
      seen: false,
    });
  }

  if (count % progressCount === 0) console.warn(`${count} ${user._id}`);
  return User.updateOne({ _id: user._id }, { $inc: inc, $push: push, $set: set }).exec();
}

export default async function processUsers () {
  const query = {
    migration: { $ne: MIGRATION_NAME },
    'auth.timestamps.loggedin': { $gt: new Date('2024-10-01') },
  };

  const fields = {
    _id: 1,
    items: 1,
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
